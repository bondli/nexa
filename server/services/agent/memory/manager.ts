import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import logger from 'electron-log';
import ChatMessage from '../../../models/ChatMessage';
import type { ChatMessage as ChatMessageType } from '../types';

/**
 * 消息历史管理器
 * 负责加载和保存对话历史
 * 每条消息独立一行记录，追加写入不覆盖
 */
class MessageHistoryManager {
  /**
   * 加载会话消息历史
   */
  async loadMessages(sessionId: string): Promise<ChatMessageType[]> {
    try {
      const records = await ChatMessage.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
      });

      return records.map((record) => ({
        role: record.role as ChatMessageType['role'],
        content: record.content,
      }));
    } catch (error) {
      logger.error('[MessageHistoryManager] Error loading messages:', error);
      return [];
    }
  }

  /**
   * 追加单条消息
   */
  async appendMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<void> {
    try {
      await ChatMessage.create({ sessionId, role, content } as any);
      logger.debug(`[MessageHistoryManager] Appended message: ${sessionId}, role: ${role}`);
    } catch (error) {
      logger.error('[MessageHistoryManager] Error appending message:', error);
    }
  }

  /**
   * 批量追加消息（仅保存新增的消息）
   */
  async appendMessages(
    sessionId: string,
    messages: Array<{ role: string; content: string }>,
  ): Promise<void> {
    if (!messages.length) return;

    try {
      const records = messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          sessionId,
          role: msg.role === 'assistant' ? 'assistant' as const : 'user' as const,
          content: msg.content,
        }));

      await ChatMessage.bulkCreate(records as any);
      logger.debug(`[MessageHistoryManager] Appended ${records.length} messages: ${sessionId}`);
    } catch (error) {
      logger.error('[MessageHistoryManager] Error appending messages:', error);
    }
  }

  /**
   * 删除会话消息
   */
  async deleteMessages(sessionId: string): Promise<number> {
    try {
      const count = await ChatMessage.destroy({
        where: { sessionId },
      });

      logger.info(`[MessageHistoryManager] Deleted ${count} messages for session: ${sessionId}`);
      return count;
    } catch (error) {
      logger.error('[MessageHistoryManager] Error deleting messages:', error);
      return 0;
    }
  }

  /**
   * 转换为 LangChain 消息格式
   */
  toLangChainMessages(messages: Array<{ role: string; content: string }>): BaseMessage[] {
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
   * 从 LangChain 消息格式转换
   */
  fromLangChainMessages(messages: BaseMessage[]): Array<{ role: string; content: string }> {
    return messages.map((msg) => {
      // content 可能是 string 或 ContentBlock[]，统一转为 string
      const contentStr = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      if (msg instanceof HumanMessage) {
        return { role: 'user', content: contentStr };
      } else if (msg instanceof AIMessage) {
        return { role: 'assistant', content: contentStr };
      } else {
        return { role: 'system', content: contentStr };
      }
    });
  }
}

// 全局单例
let messageHistoryManager: MessageHistoryManager | null = null;

/**
 * 获取消息历史管理器实例
 */
export const getMessageHistoryManager = (): MessageHistoryManager => {
  if (!messageHistoryManager) {
    messageHistoryManager = new MessageHistoryManager();
  }
  return messageHistoryManager;
};

export default MessageHistoryManager;
