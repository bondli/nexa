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
  checkpointId?: string;
  threadId?: string;
}

const extractMessagesFromCheckpoint = (checkpoint): MessageItem[] => {
  try {
    if (!checkpoint.checkpoint?.channel_values?.messages) {
      return [];
    }

    const messages = checkpoint.checkpoint.channel_values.messages;
    if (!Array.isArray(messages)) {
      return [];
    }

    const extractedMessages: MessageItem[] = [];

    for (const msg of messages) {
      // 过滤有效消息
      if (!msg?.kwargs?.content && !msg?.content) {
        continue;
      }
      // 将summarize节点的消息过滤掉，不输出到前端
      if (msg.kwargs?.content && msg.kwargs.content.includes('<summarize>')) {
        continue;
      }

      let content: string;
      let role: 'user' | 'assistant' | 'system';

      if (msg.kwargs?.content) {
        // LangChain 格式
        content = msg.kwargs.content;

        // 从 id 数组中提取消息类型
        if (msg.id && Array.isArray(msg.id) && msg.id.length >= 3) {
          const messageType = msg.id[2];
          if (messageType.includes('Human')) {
            role = 'user';
          } else if (messageType.includes('AI')) {
            role = 'assistant';
          } else {
            role = 'system';
            // 判断是否tools返回的消息
            if (msg.kwargs.tool_call_id && msg.kwargs.name) {
              content = `<tool_call>${msg.kwargs.name}__TOOLCALL__${msg.kwargs.content}</tool_call>`;
            }
          }
        } else {
          role = 'system';
        }
      } else {
        // 普通格式
        content = msg.content;
        role = (msg.role as 'user' | 'assistant' | 'system') || 'system';
      }

      extractedMessages.push({
        role,
        content,
        timestamp: new Date(),
        checkpointId: checkpoint.checkpointId,
        threadId: checkpoint.threadId,
      });
    }

    return extractedMessages;
  } catch (error) {
    logger.error('[MessageService] Error extracting messages from checkpoint:', error);
    return [];
  }
};

/**
 * 获取会话的消息列表（独立消息格式）
 * @param threadId 会话线程ID
 * @returns 独立消息列表
 */
export const getMessages = async (threadId: string): Promise<MessageItem[]> => {
  try {
    // 验证输入参数
    if (!threadId || typeof threadId !== 'string') {
      logger.warn('[MessageService] Invalid threadId provided:', threadId);
      return [];
    }

    // 使用参数化查询避免SQL注入
    const sqlQuery =
      "SELECT thread_id as threadId, checkpoint, metadata, created_at as createdAt FROM checkpoints WHERE thread_id = ? and checkpoint_ns = '' ORDER BY created_at DESC LIMIT 1";

    const results = await sequelize.query(sqlQuery, {
      replacements: [threadId],
      type: QueryTypes.SELECT,
    });

    const checkpoints = (results as any[]) || [];

    if (checkpoints.length === 0) {
      logger.info(`[MessageService] No checkpoints found for threadId: ${threadId}`);
      return [];
    }

    // 从最新检查点提取所有消息
    const checkpoint = checkpoints[0];

    // 解析 checkpoint 字段（JSON 字符串）
    if (checkpoint.checkpoint && typeof checkpoint.checkpoint === 'string') {
      try {
        checkpoint.checkpoint = JSON.parse(checkpoint.checkpoint);
      } catch (parseError) {
        logger.error('[MessageService] Error parsing checkpoint JSON:', parseError);
        return [];
      }
    }
    const messages = extractMessagesFromCheckpoint(checkpoint);

    logger.info(`[MessageService] Extracted ${messages.length} messages from threadId ${checkpoint.threadId}`);

    return messages;
  } catch (error) {
    logger.error('[MessageService] Error getting conversation messages:', error);
    return [];
  }
};

/**
 * 删除会话的所有消息
 * @param threadId 会话线程ID (对应sessionId)
 * @returns 删除的记录数量
 */
export const deleteMessages = async (threadId: string): Promise<{ deletedCheckpoints: number }> => {
  try {
    // 再删除Checkpoint表中的相关记录
    const deleteCheckpointsQuery = 'DELETE FROM checkpoints WHERE thread_id = ?';
    const [deletedCheckpointsResult] = await sequelize.query(deleteCheckpointsQuery, {
      replacements: [threadId],
    });
    const deletedCheckpoints = (deletedCheckpointsResult as any).affectedRows || 0;

    logger.info(`[MessageService] Deleted ${deletedCheckpoints} checkpoints for threadId: ${threadId}`);

    return {
      deletedCheckpoints,
    };
  } catch (error) {
    logger.error('[MessageService] Error deleting messages for conversation:', error);
    throw error;
  }
};
