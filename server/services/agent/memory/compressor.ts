import { ChatOpenAI } from '@langchain/openai';
import type { ChatMessage, CompressionResult } from '../types';
import { loadLLMConfig, getDefaultBaseUrl } from '../llm-config';
import logger from 'electron-log';

/**
 * 上下文压缩配置
 */
export interface CompressionConfig {
  maxRecentMessages: number;
  summaryMaxTokens: number;
  enabled: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: CompressionConfig = {
  maxRecentMessages: 10,
  summaryMaxTokens: 500,
  enabled: true,
};

/**
 * 上下文压缩器
 * 使用 LLM 对历史消息进行摘要压缩
 */
class ContextCompressor {
  private config: CompressionConfig;
  // 缓存每个会话的摘要
  private sessionSummaries: Map<string, string> = new Map();

  constructor(config?: Partial<CompressionConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 初始化 LLM
   */
  private getLLM(): ChatOpenAI {
    const llmConfig = loadLLMConfig();
    return new ChatOpenAI({
      model: llmConfig.model || 'gpt-4',
      temperature: 0.5,
      maxTokens: this.config.summaryMaxTokens,
      apiKey: llmConfig.apiKey,
      configuration: {
        baseURL: llmConfig.baseUrl || getDefaultBaseUrl(llmConfig.provider),
      },
    });
  }

  /**
   * 检查是否需要压缩
   */
  shouldCompress(messages: ChatMessage[]): boolean {
    if (!this.config.enabled) {
      return false;
    }

    // 超过最大消息数时需要压缩
    return messages.length > this.config.maxRecentMessages;
  }

  /**
   * 压缩上下文
   * 将较早的消息通过 LLM 生成摘要，保留最近的消息
   */
  async compress(sessionId: string, messages: ChatMessage[]): Promise<CompressionResult> {
    const originalCount = messages.length;

    if (!this.shouldCompress(messages)) {
      return {
        messages,
        summary: '',
        originalCount,
        compressedCount: originalCount,
      };
    }

    try {
      // 需要压缩的早期消息
      const olderMessages = messages.slice(0, -this.config.maxRecentMessages);
      // 保留的最近消息
      const recentMessages = messages.slice(-this.config.maxRecentMessages);

      // 获取已有的摘要，追加新内容
      const existingSummary = this.sessionSummaries.get(sessionId) || '';

      // 拼接需要摘要的消息文本
      const messagesText = olderMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join('\n');

      // 构建摘要提示
      const summaryPrompt = existingSummary
        ? `以下是已有的对话摘要：\n${existingSummary}\n\n请将以下新的对话内容合并到摘要中，生成一个更完整的摘要：\n${messagesText}`
        : `请将以下对话内容总结为简洁的摘要，保留关键信息：\n${messagesText}`;

      // 调用 LLM 生成摘要
      const llm = this.getLLM();
      const response = await llm.invoke([{ role: 'user', content: summaryPrompt }]);
      const newSummary = typeof response.content === 'string' ? response.content : '';

      // 缓存摘要
      this.sessionSummaries.set(sessionId, newSummary);

      const compressedCount = recentMessages.length + 1; // +1 for summary

      logger.info(
        `[ContextCompressor] Compressed ${originalCount} messages to ${compressedCount} (summary + ${recentMessages.length} recent)`,
      );

      return {
        messages: recentMessages,
        summary: newSummary,
        originalCount,
        compressedCount,
      };
    } catch (error) {
      logger.error('[ContextCompressor] Compression error:', error);
      // 压缩失败，返回原始消息
      return {
        messages,
        summary: '',
        originalCount,
        compressedCount: originalCount,
      };
    }
  }

  /**
   * 清理会话内存
   */
  clearSession(sessionId: string): void {
    this.sessionSummaries.delete(sessionId);
    logger.info(`[ContextCompressor] Cleared memory for session: ${sessionId}`);
  }

  /**
   * 清理所有会话内存
   */
  clearAll(): void {
    this.sessionSummaries.clear();
    logger.info('[ContextCompressor] Cleared all session memories');
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): CompressionConfig {
    return { ...this.config };
  }
}

// 全局单例
let contextCompressor: ContextCompressor | null = null;

/**
 * 获取上下文压缩器实例
 */
export const getContextCompressor = (config?: Partial<CompressionConfig>): ContextCompressor => {
  if (!contextCompressor) {
    contextCompressor = new ContextCompressor(config);
  }
  return contextCompressor;
};

export default ContextCompressor;
