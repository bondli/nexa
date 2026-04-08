import logger from 'electron-log';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

/**
 * 单条消息的接口
 */
export interface MessageItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * 获取会话的消息列表（从 chat_messages 表）
 * @param sessionId 会话ID
 * @returns 消息列表
 */
export const getMessages = async (sessionId: string): Promise<MessageItem[]> => {
  try {
    if (!sessionId || typeof sessionId !== 'string') {
      logger.warn('[MessageService] Invalid sessionId provided:', sessionId);
      return [];
    }

    const sqlQuery = `
      SELECT role, content, created_at as timestamp
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `;

    const results = await sequelize.query(sqlQuery, {
      replacements: [sessionId],
      type: QueryTypes.SELECT,
    });

    const messages = (results as MessageItem[]) || [];

    logger.info(`[MessageService] Retrieved ${messages.length} messages for sessionId: ${sessionId}`);

    return messages;
  } catch (error) {
    logger.error('[MessageService] Error getting conversation messages:', error);
    return [];
  }
};

/**
 * 保存单条消息到数据库
 * @param sessionId 会话ID
 * @param role 角色 (user/assistant)
 * @param content 消息内容
 */
export const saveMessage = async (sessionId: string, role: string, content: string): Promise<void> => {
  try {
    await sequelize.query(
      `INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (?, ?, ?, ?)`,
      {
        replacements: [sessionId, role, content, new Date()],
        type: QueryTypes.INSERT,
      }
    );
    logger.info(`[MessageService] Saved message for sessionId: ${sessionId}, role: ${role}`);
  } catch (error) {
    logger.error('[MessageService] Error saving message:', error);
    throw error;
  }
};

/**
 * 删除会话的所有消息
 * @param sessionId 会话ID
 * @returns 删除的记录数量
 */
export const deleteMessages = async (sessionId: string): Promise<{ deletedMessages: number }> => {
  try {
    const deleteQuery = 'DELETE FROM chat_messages WHERE session_id = ?';
    const [result] = await sequelize.query(deleteQuery, {
      replacements: [sessionId],
    });
    const deletedMessages = (result as any).affectedRows || 0;

    logger.info(`[MessageService] Deleted ${deletedMessages} messages for sessionId: ${sessionId}`);

    return { deletedMessages };
  } catch (error) {
    logger.error('[MessageService] Error deleting messages:', error);
    throw error;
  }
};
