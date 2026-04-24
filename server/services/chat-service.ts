import logger from 'electron-log';
import ChatMessage from '../models/ChatMessage';

/**
 * 单条消息的接口
 */
export interface MessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 获取会话的消息列表（从 ChatMessage 表，每条消息一行）
 */
export const getMessages = async (sessionId: string): Promise<MessageItem[]> => {
  try {
    if (!sessionId || typeof sessionId !== 'string') {
      logger.warn('[MessageService] Invalid sessionId provided:', sessionId);
      return [];
    }

    const records = await ChatMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
    });

    const messages: MessageItem[] = records.map((record) => ({
      role: record.role as MessageItem['role'],
      content: record.content,
      timestamp: record.createdAt || new Date(),
    }));

    logger.info(`[MessageService] Retrieved ${messages.length} messages for sessionId: ${sessionId}`);

    return messages;
  } catch (error) {
    logger.error('[MessageService] Error getting conversation messages:', error);
    return [];
  }
};

/**
 * 删除会话的所有消息
 */
export const deleteMessages = async (sessionId: string): Promise<{ deletedMessages: number }> => {
  try {
    const deletedMessages = await ChatMessage.destroy({
      where: { sessionId },
    });

    logger.info(`[MessageService] Deleted ${deletedMessages} messages for sessionId: ${sessionId}`);
    return { deletedMessages };
  } catch (error) {
    logger.error('[MessageService] Error deleting messages:', error);
    throw error;
  }
};
