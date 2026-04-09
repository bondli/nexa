import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import logger from 'electron-log';
import { LLMConfig, loadLLMConfig, getDefaultBaseUrl } from '../config/llm-config';
import { getCheckpointSaver } from '../checkpoint/mysql-checkpoint';

/**
 * Agent 配置
 */
export interface AgentConfig {
  config?: LLMConfig;
  systemMessage?: string;
}

/**
 * 工具调用类型
 */
export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * 流式回调类型
 */
export type StreamCallback = (content: string, done: boolean, toolCalls?: string[]) => void;

/**
 * 内部工具定义
 */
interface InternalTool {
  name: string;
  description: string;
  execute: (params: Record<string, unknown>) => Promise<string>;
}

/**
 * 内部工具列表
 */
const internalTools: InternalTool[] = [
  {
    name: 'write_note',
    description: '创建一条新笔记。输入应包含 title（标题）和 content（内容）。',
    execute: async (params) => {
      const title = params.title as string;
      const content = params.content as string;
      if (!title || !content) {
        return JSON.stringify({ success: false, error: '缺少必要参数 title 或 content' });
      }
      logger.info('[write_note] 创建笔记:', { title, contentLength: content.length });
      return JSON.stringify({ success: true, message: '笔记创建成功', noteId: `note_${Date.now()}`, title });
    },
  },
  {
    name: 'search_notes',
    description: '根据关键词搜索笔记。输入应为 searchQuery（搜索关键词）。',
    execute: async (params) => {
      const searchQuery = params.searchQuery as string;
      if (!searchQuery) {
        return JSON.stringify({ success: false, error: '缺少必要参数 searchQuery' });
      }
      logger.info('[search_notes] 搜索:', searchQuery);
      const mockResults = [
        { id: 1, title: '学习笔记', content: '今天学习了 TypeScript...' },
        { id: 2, title: 'React 笔记', content: 'React 组件开发...' },
      ];
      return JSON.stringify({ success: true, results: mockResults, count: mockResults.length });
    },
  },
  {
    name: 'get_weather',
    description: '查询指定城市的天气。输入应为 city（城市名称）。',
    execute: async (params) => {
      const city = params.city as string;
      if (!city) {
        return JSON.stringify({ success: false, error: '缺少必要参数 city' });
      }
      logger.info('[get_weather] 查询城市:', city);
      const weatherConditions = ['晴', '多云', '阴', '小雨', '大雨', '雪'];
      const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
      const temperature = Math.floor(Math.random() * 30) + 5;
      return JSON.stringify({ success: true, city, weather: randomCondition, temperature: `${temperature}°C` });
    },
  },
];

/**
 * 获取工具描述
 */
const getToolsDescription = (): string => {
  return internalTools.map((t) => `- ${t.name}: ${t.description}`).join('\n');
};

/**
 * 解析工具调用
 */
const parseToolCalls = (response: string): ToolCall[] => {
  const toolCalls: ToolCall[] = [];

  // 尝试匹配 JSON 格式的工具调用
  const jsonMatch = response.match(/```json\s*(\[[\s\S]*?\])\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // 忽略解析错误
    }
  }

  return toolCalls;
};

/**
 * 调用工具
 */
const executeTool = async (name: string, args: Record<string, unknown>): Promise<string> => {
  const tool = internalTools.find((t) => t.name === name);
  if (!tool) {
    return JSON.stringify({ success: false, error: `未知工具: ${name}` });
  }
  return tool.execute(args);
};

/**
 * LangGraph Agent - 使用 MySQL chat_messages 表持久化消息
 */
export class LangGraphAgent {
  private llm: ChatOpenAI;
  private config: LLMConfig;

  constructor(agentConfig?: AgentConfig) {
    this.config = agentConfig?.config || loadLLMConfig();

    // 创建 LLM 实例
    this.llm = new ChatOpenAI({
      model: this.config.model || 'gpt-4',
      temperature: this.config.temperature || 0.7,
      maxTokens: this.config.maxTokens || 2000,
      apiKey: this.config.apiKey,
      configuration: {
        baseURL: this.config.baseUrl || getDefaultBaseUrl(this.config.provider),
      },
      streaming: true,
    });

    logger.info('[LangGraphAgent] Agent 初始化完成');
  }

  /**
   * 转换消息格式
   */
  private convertToLangChainMessages(messages: Array<{ role: string; content: string }>): BaseMessage[] {
    return messages.map((msg) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      } else {
        return new SystemMessage(msg.content);
      }
    });
  }

  /**
   * 保存消息到数据库（通过 checkpoint）
   */
  private async saveMessages(sessionId: string, messages: Array<{ role: string; content: string }>): Promise<void> {
    try {
      const checkpointSaver = getCheckpointSaver();

      // 将消息转换为 checkpoint 格式
      const checkpointData = {
        id: `cp_${Date.now()}`,
        ts: new Date().toISOString(),
        channel_values: {
          messages: messages
            .filter((msg) => msg.role !== 'system')
            .map((msg) => ({
              id: [msg.role],
              kwargs: { content: msg.content },
              type: msg.role === 'assistant' ? 'ai' : 'human',
            })),
        },
      };

      await checkpointSaver.put(
        { configurable: { thread_id: sessionId } },
        checkpointData,
        { messageCount: messages.length },
        {},
      );

      logger.info(`[LangGraphAgent] 消息已保存到数据库: ${sessionId}, 共${messages.length}条`);
    } catch (error) {
      logger.error('[LangGraphAgent] 保存消息失败:', error);
    }
  }

  /**
   * 对话 - 使用 sessionId 作为 threadId 实现持久化
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    sessionId: string,
    streamCallback?: StreamCallback,
  ): Promise<string> {
    // 构建包含工具信息的系统消息
    const toolsDescription = getToolsDescription();
    const systemMsg = `${this.config.systemMessage || '你是一个智能助手，可以调用工具来完成任务。'}\n\n可用工具:\n${toolsDescription}\n\n当需要调用工具时，请使用以下格式返回 JSON 数组：\n[{"name": "工具名", "arguments": {"参数": "值"}}]`;

    // 先保存用户消息到 checkpoint
    await this.saveMessages(sessionId, messages);

    const langchainMessages = [new SystemMessage(systemMsg), ...this.convertToLangChainMessages(messages)];

    try {
      // 调用 LLM
      const response = await this.llm.stream(langchainMessages);

      let fullContent = '';
      const toolCalls: string[] = [];

      for await (const chunk of response) {
        const content = chunk.content;
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr) {
          fullContent += contentStr;
          if (streamCallback) {
            streamCallback(contentStr, false);
          }
        }
      }

      // 解析工具调用
      const parsedToolCalls = parseToolCalls(fullContent);

      if (parsedToolCalls.length > 0) {
        // 执行工具调用
        for (const toolCall of parsedToolCalls) {
          toolCalls.push(toolCall.name);
          if (streamCallback) {
            streamCallback('', false, [toolCall.name]);
          }

          logger.info(`[Agent] 调用工具: ${toolCall.name}`, toolCall.arguments);
          const toolResult = await executeTool(toolCall.name, toolCall.arguments);

          // 将工具结果添加到消息中
          const newMessages = [
            ...messages,
            { role: 'assistant', content: fullContent },
            { role: 'user', content: `工具 ${toolCall.name} 返回结果: ${toolResult}` },
          ];

          // 保存更新后的消息
          await this.saveMessages(sessionId, newMessages);

          // 再次调用 LLM
          const toolMessages = [new SystemMessage(systemMsg), ...this.convertToLangChainMessages(newMessages)];

          const toolResponse = await this.llm.stream(toolMessages);
          let toolFullContent = '';

          for await (const chunk of toolResponse) {
            const c = chunk.content;
            const cStr = typeof c === 'string' ? c : '';
            if (cStr) {
              toolFullContent += cStr;
              if (streamCallback) {
                streamCallback(cStr, false);
              }
            }
          }

          fullContent = toolFullContent;
        }
      }

      // 保存最终消息
      await this.saveMessages(sessionId, [...messages, { role: 'assistant', content: fullContent }]);

      if (streamCallback) {
        streamCallback('', true, toolCalls);
      }

      logger.info(`[LangGraphAgent] 对话完成，sessionId: ${sessionId}`);
      return fullContent;
    } catch (error) {
      logger.error('[LangGraphAgent] Chat error:', error);
      throw error;
    }
  }

  /**
   * 简单对话（无工具）
   */
  async simpleChat(
    messages: Array<{ role: string; content: string }>,
    sessionId: string,
    streamCallback?: StreamCallback,
  ): Promise<string> {
    // 先保存用户消息到 checkpoint
    await this.saveMessages(sessionId, messages);

    const langchainMessages = this.convertToLangChainMessages(messages);

    try {
      const stream = await this.llm.stream(langchainMessages);

      let fullContent = '';

      for await (const chunk of stream) {
        const content = chunk.content;
        const contentStr = typeof content === 'string' ? content : '';
        if (contentStr) {
          fullContent += contentStr;
          if (streamCallback) {
            streamCallback(contentStr, false);
          }
        }
      }

      // 保存最终消息
      await this.saveMessages(sessionId, [...messages, { role: 'assistant', content: fullContent }]);

      if (streamCallback) {
        streamCallback('', true);
      }

      return fullContent;
    } catch (error) {
      logger.error('[LangGraphAgent] Simple chat error:', error);
      throw error;
    }
  }

  /**
   * 重新配置 LLM
   */
  reconfigure(config: LLMConfig): void {
    this.config = config;
    this.llm = new ChatOpenAI({
      model: config.model || 'gpt-4',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
      apiKey: config.apiKey,
      configuration: {
        baseURL: config.baseUrl || getDefaultBaseUrl(config.provider),
      },
      streaming: true,
    });

    logger.info('[LangGraphAgent] LLM 已重新配置');
  }
}

/**
 * 创建 Agent 实例
 */
export const createAgent = async (config?: AgentConfig): Promise<LangGraphAgent> => {
  return new LangGraphAgent(config);
};
