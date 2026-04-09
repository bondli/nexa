import logger from 'electron-log';
import ChatMessage, { CheckpointInstance } from '../models/ChatMessage';

/**
 * 单条消息的接口
 */
export interface MessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 从 checkpoint 中提取消息列表
 */
const extractMessagesFromCheckpoint = (checkpoint: Record<string, unknown>): MessageItem[] => {
  const messages: MessageItem[] = [];
  const channelValues = checkpoint.channel_values as Record<string, unknown> | undefined;

  if (channelValues?.messages && Array.isArray(channelValues.messages)) {
    for (const msg of channelValues.messages) {
      const msgObj = msg as { id: string[]; kwargs: { content: string }; type: string };
      if (msgObj.kwargs?.content) {
        // 根据 type 判断 role
        let role: 'user' | 'assistant' | 'system' = 'user';
        if (msgObj.type === 'ai' || msgObj.type === 'AIMessage') {
          role = 'assistant';
        } else if (msgObj.type === 'system') {
          role = 'system';
        }
        messages.push({
          role,
          content: msgObj.kwargs.content,
          timestamp: new Date(),
        });
      }
    }
  }

  return messages;
};

/**
 * 获取会话的消息列表（从 ChatMessage checkpoint 表）
 */
export const getMessages = async (sessionId: string): Promise<MessageItem[]> => {
  try {
    if (!sessionId || typeof sessionId !== 'string') {
      logger.warn('[MessageService] Invalid sessionId provided:', sessionId);
      return [];
    }

    // 获取最新的 checkpoint
    const checkpoint = await ChatMessage.findOne({
      where: { sessionId, checkpointNs: '' },
      order: [['createdAt', 'DESC']],
    });

    if (!checkpoint) {
      return [];
    }

    const messages = extractMessagesFromCheckpoint(checkpoint.checkpoint);
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
