import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
// @ts-ignore - 子路径导出在 moduleResolution:node 下不可见，但运行时正常
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import logger from 'electron-log';
import type {
  AgentConfig,
  AgentResult,
  ChatMessage,
  StreamCallback,
  ExtendedStreamCallback,
  ToolCall,
  RAGConfig,
  ExecutionEvent,
} from './types';
import { loadLLMConfig, getDefaultBaseUrl } from './llm-config';
import { getToolRegistry } from './tools';
import { getSkillRegistry } from './skills';
import { getMessageHistoryManager } from './memory/manager';
import { getContextCompressor } from './memory/compressor';
import { ToolExecutionCallbackHandler } from './callbacks/tool-callback';
import { getRetrievalService } from './rag';
import { logAgentExecution, logAgentError } from './logging';

/**
 * LangGraph Agent 实现
 */
class Agent {
  private llm: ChatOpenAI;
  private config: AgentConfig;
  private messageManager = getMessageHistoryManager();
  private compressor = getContextCompressor();
  private retrievalService = getRetrievalService();

  constructor(config?: Partial<AgentConfig>) {
    this.config = {
      sessionId: '',
      useTools: true,
      useRAG: false,
      knowledgeIds: [],
      maxRecentMessages: 20,
      summaryMaxTokens: 500,
      enableHumanInLoop: true,
      timeout: 60000,
      ...config,
    };

    // 初始化 LLM
    const llmConfig = loadLLMConfig();
    this.llm = new ChatOpenAI({
      model: llmConfig.model || 'gpt-4',
      temperature: llmConfig.temperature || 0.7,
      maxTokens: llmConfig.maxTokens || 2000,
      apiKey: llmConfig.apiKey,
      configuration: {
        baseURL: llmConfig.baseUrl || getDefaultBaseUrl(llmConfig.provider),
      },
      streaming: true,
    });

    // 注册内置工具和 Skills
    this.initializeTools();

    logger.info('[Agent] Agent initialized');
  }

  /**
   * 初始化工具和 Skills
   */
  private initializeTools(): void {
    try {
      // 注册内置工具
      const { registerBuiltInTools } = require('./tools/builtins');
      registerBuiltInTools();

      // 注册系统工具（沙箱工具）
      const { registerSystemTools } = require('./tools/system-tools');
      registerSystemTools();

      // 注册内置 Skills
      const { registerBuiltInSkills } = require('./skills/builtins');
      registerBuiltInSkills();

      // 将 Skills 转换为工具
      const skillRegistry = getSkillRegistry();
      skillRegistry.registerSkillsAsTools();

      logger.info('[Agent] Tools and skills initialized');
    } catch (error) {
      logger.error('[Agent] Error initializing tools:', error);
    }
  }

  /**
   * 设置会话 ID
   */
  setSessionId(sessionId: string): void {
    this.config.sessionId = sessionId;
  }

  /**
   * 加载历史消息
   */
  private async loadHistory(): Promise<ChatMessage[]> {
    if (!this.config.sessionId) {
      return [];
    }

    const messages = await this.messageManager.loadMessages(this.config.sessionId);
    logAgentExecution(this.config.sessionId, 'Loaded history', { count: messages.length });
    return messages;
  }

  /**
   * 追加新消息到数据库
   */
  private async appendMessages(messages: Array<{ role: string; content: string }>): Promise<void> {
    if (!this.config.sessionId) {
      return;
    }

    await this.messageManager.appendMessages(this.config.sessionId, messages);
  }

  /**
   * 执行对话
   */
  async chat(
    messages: Array<{ role: string; content: string }>,
    sessionId: string,
    streamCallback?: StreamCallback,
    extendedCallback?: ExtendedStreamCallback,
  ): Promise<AgentResult> {
    this.config.sessionId = sessionId;

    try {
      logAgentExecution(sessionId, 'Starting chat', { messageCount: messages.length, useTools: this.config.useTools });

      // 发送思考中事件
      if (extendedCallback) {
        extendedCallback({ type: 'thinking', data: { thinking: { message: '正在分析您的问题...' } } });
      }

      // 1. 加载历史消息
      const historyMessages = await this.loadHistory();

      // 2. 合并历史消息和当前消息
      const allMessages: ChatMessage[] = [
        ...historyMessages,
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content,
        })),
      ];

      // 3. 先将用户消息追加到数据库（不等待历史加载和压缩影响）
      await this.appendMessages(messages);

      // 4. 构建发送给 LLM 的上下文（可能经过压缩，但不影响数据库存储）
      let contextForLLM: ChatMessage[] = [...allMessages];
      if (this.compressor.shouldCompress(contextForLLM)) {
        const compressed = await this.compressor.compress(sessionId, contextForLLM);
        contextForLLM = compressed.messages;
        logAgentExecution(sessionId, 'Compressed context for LLM', {
          original: compressed.originalCount,
          compressed: compressed.compressedCount,
        });
      }

      // 5. 如果启用 RAG，检索相关上下文
      let ragContext = '';
      if (this.config.useRAG && this.config.knowledgeIds && this.config.knowledgeIds.length > 0) {
        const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
        if (lastUserMessage) {
          const ragConfig: RAGConfig = {
            knowledgeIds: this.config.knowledgeIds,
            topK: 5,
          };
          const ragResult = await this.retrievalService.prepareRAGContext(lastUserMessage.content, ragConfig);
          ragContext = ragResult.context;
          logAgentExecution(sessionId, 'RAG retrieval', { hasResults: ragResult.hasResults });
        }
      }

      // 6. 转换为 LangChain 消息（使用压缩后的上下文）
      const lcMessages = this.messageManager.toLangChainMessages(contextForLLM);

      // 7. 添加系统消息
      const systemMessage = this.buildSystemMessage(ragContext);
      const fullMessages = [new SystemMessage(systemMessage), ...lcMessages];

      // 8. 执行对话
      let result: string;
      const toolCalls: ToolCall[] = [];

      if (this.config.useTools) {
        result = await this.chatWithTools(fullMessages, streamCallback, toolCalls, extendedCallback);
      } else {
        result = await this.chatWithoutTools(fullMessages, streamCallback, extendedCallback);
      }

      // 发送最终回答事件
      if (extendedCallback) {
        extendedCallback({ type: 'final', data: { final: { content: result } } });
      }

      // 9. 只追加 assistant 的回复到数据库（用户消息已经在步骤3中追加）
      await this.appendMessages([{ role: 'assistant', content: result }]);

      return { content: result, toolCalls: toolCalls.length > 0 ? toolCalls : undefined };
    } catch (error) {
      logAgentError(sessionId, error, { messagesLength: messages.length });
      throw error;
    }
  }

  /**
   * 构建系统消息
   */
  private buildSystemMessage(ragContext: string): string {
    const toolRegistry = getToolRegistry();
    const toolsDescription = toolRegistry.getToolsDescription();

    let systemMessage = this.config.systemMessage || '你是一个智能助手，可以调用工具来完成任务。';

    if (this.config.useTools && toolsDescription) {
      systemMessage += `\n\n可用工具:\n${toolsDescription}`;
    }

    if (ragContext) {
      systemMessage += `\n\n${ragContext}`;
    }

    return systemMessage;
  }

  /**
   * 带工具的对话
   */
  private async chatWithTools(
    messages: BaseMessage[],
    streamCallback?: StreamCallback,
    toolCalls?: ToolCall[],
    extendedCallback?: ExtendedStreamCallback,
  ): Promise<string> {
    const toolRegistry = getToolRegistry();
    const tools = toolRegistry.getLangChainTools();
    const effectiveToolCalls = toolCalls || [];

    // 创建 React Agent
    const agent = createReactAgent({
      llm: this.llm,
      tools,
    });

    // 创建工具执行回调处理器
    const toolCallbackHandler = new ToolExecutionCallbackHandler(extendedCallback);

    // 流式调用
    let fullContent = '';
    const stream = await agent.stream(
      { messages },
      {
        configurable: { thread_id: this.config.sessionId },
        callbacks: [toolCallbackHandler],
      },
    );

    for await (const chunk of stream) {
      // chunk 是 Record<string, unknown> 类型，需要安全访问
      const chunkData = chunk as unknown as Record<string, unknown>;

      // Debug: 记录所有 chunk 类型
      const chunkTypes = Object.keys(chunkData);
      logger.info(`[chatWithTools] Chunk types=${chunkTypes.join(',')}`);

      // 处理 agent 消息
      if (chunkData.agent) {
        const agentData = chunkData.agent as { messages: Array<{ content: string }> };
        const content = agentData.messages[0]?.content;
        if (content) {
          fullContent += content;
          if (streamCallback) {
            streamCallback(content, false);
          }
        }
      }

      // 处理工具调用
      if (chunkData.tools) {
        const toolsData = chunkData.tools as { messages: Array<Record<string, unknown>> };
        const toolMessage = toolsData.messages[0];
        const toolCallsList = toolMessage?.tool_calls as Array<{ name: string; args: Record<string, unknown> }> | undefined;
        if (toolCallsList) {
          for (const tc of toolCallsList) {
            effectiveToolCalls.push({
              name: tc.name,
              arguments: tc.args,
            });

            // 发送工具调用事件
            if (extendedCallback) {
              extendedCallback({
                type: 'tool_call',
                data: { tool_call: { tool: tc.name, params: tc.args } },
              });
              extendedCallback({
                type: 'tool_start',
                data: { tool_start: { tool: tc.name, message: `正在执行 ${tc.name}...` } },
              });
            }

            if (streamCallback) {
              streamCallback('', false, [tc.name]);
            }
          }
        }
      }
    }

    if (streamCallback) {
      streamCallback('', true, effectiveToolCalls.map((tc) => tc.name));
    }

    return fullContent;
  }

  /**
   * 不带工具的对话
   */
  private async chatWithoutTools(
    messages: BaseMessage[],
    streamCallback?: StreamCallback,
    extendedCallback?: ExtendedStreamCallback,
  ): Promise<string> {
    let fullContent = '';
    const stream = await this.llm.stream(messages);

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

    if (streamCallback) {
      streamCallback('', true);
    }

    return fullContent;
  }

  /**
   * 简单对话（无工具）
   */
  async simpleChat(
    messages: Array<{ role: string; content: string }>,
    sessionId: string,
    extendedCallback?: ExtendedStreamCallback,
  ): Promise<string> {
    this.config.useTools = false;
    const result = await this.chat(messages, sessionId, undefined, extendedCallback);
    return result.content;
  }

  /**
   * 重新配置 LLM
   */
  reconfigure(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };

    const llmConfig = loadLLMConfig();
    this.llm = new ChatOpenAI({
      model: llmConfig.model || 'gpt-4',
      temperature: llmConfig.temperature || 0.7,
      maxTokens: llmConfig.maxTokens || 2000,
      apiKey: llmConfig.apiKey,
      configuration: {
        baseURL: llmConfig.baseUrl || getDefaultBaseUrl(llmConfig.provider),
      },
      streaming: true,
    });

    logger.info('[Agent] LLM reconfigured');
  }

  /**
   * 清理会话
   */
  cleanup(sessionId: string): void {
    this.compressor.clearSession(sessionId);
    logger.info(`[Agent] Cleaned up session: ${sessionId}`);
  }
}

/**
 * 创建 Agent 实例
 */
export const createAgent = (config?: Partial<AgentConfig>): Agent => {
  return new Agent(config);
};

export default Agent;
