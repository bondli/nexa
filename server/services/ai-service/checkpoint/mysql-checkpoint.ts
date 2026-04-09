import logger from 'electron-log';
import ChatMessage from '../../../models/ChatMessage';

/**
 * Checkpoint 数据结构
 */
interface CheckpointData {
  id: string;
  ts: string;
  channel_values?: {
    messages?: Array<{
      id: string[];
      kwargs: {
        content: string;
        additional_kwargs?: Record<string, unknown>;
      };
      type: string;
    }>;
  };
  [key: string]: unknown;
}

/**
 * MySQL Checkpoint Saver - 使用 ChatMessage 表持久化
 */
export class MySQLCheckpointSaver {
  /**
   * 保存 checkpoint
   */
  async put(
    config: { configurable: { thread_id?: string; checkpoint_ns?: string } },
    checkpoint: CheckpointData,
    metadata: Record<string, unknown>,
    _newVersions: Record<string, unknown>,
  ): Promise<{ configurable: { thread_id: string; checkpoint_id: string } }> {
    const threadId = config.configurable?.thread_id;
    const checkpointNs = config.configurable?.checkpoint_ns || '';
    const checkpointId = checkpoint.id || `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!threadId) {
      throw new Error('thread_id is required');
    }

    try {
      await ChatMessage.upsert({
        sessionId: threadId,
        checkpointNs,
        checkpointId,
        checkpoint,
        metadata,
      });

      logger.info(`[MySQLCheckpointSaver] Saved checkpoint: ${threadId}/${checkpointId}`);

      return {
        configurable: {
          thread_id: threadId,
          checkpoint_id: checkpointId,
        },
      };
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error saving checkpoint:', error);
      throw error;
    }
  }

  /**
   * 获取最新的 checkpoint
   */
  async get(config: {
    configurable: { thread_id?: string; checkpoint_id?: string };
  }): Promise<CheckpointData | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) {
      return undefined;
    }

    try {
      let whereClause: { sessionId: string; checkpointNs: string };

      if (checkpointId) {
        whereClause = { sessionId: threadId, checkpointNs: '' };
      } else {
        whereClause = { sessionId: threadId, checkpointNs: '' };
      }

      const record = await ChatMessage.findOne({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });

      if (!record) {
        return undefined;
      }

      return record.checkpoint as CheckpointData;
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error getting checkpoint:', error);
      return undefined;
    }
  }

  /**
   * 获取 checkpoint 元组
   */
  async getTuple(config: { configurable: { thread_id?: string; checkpoint_id?: string } }): Promise<
    | {
        config: { configurable: { thread_id: string; checkpoint_id: string } };
        checkpoint: CheckpointData;
        metadata: Record<string, unknown>;
      }
    | undefined
  > {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) {
      return undefined;
    }

    try {
      const whereClause: { sessionId: string; checkpointNs: string; checkpointId?: string } = {
        sessionId: threadId,
        checkpointNs: '',
      };

      if (checkpointId) {
        whereClause.checkpointId = checkpointId;
      }

      const record = await ChatMessage.findOne({
        where: whereClause,
        order: [['createdAt', 'DESC']],
      });

      if (!record) {
        return undefined;
      }

      return {
        config: { configurable: { thread_id: threadId, checkpoint_id: record.checkpointId || '' } },
        checkpoint: record.checkpoint as CheckpointData,
        metadata: record.metadata as Record<string, unknown>,
      };
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error getting checkpoint tuple:', error);
      return undefined;
    }
  }

  /**
   * 列出所有 checkpoint 版本
   */
  async *list(
    config: { configurable: { thread_id?: string } },
    options?: { limit?: number },
  ): AsyncGenerator<{
    config: { configurable: { thread_id: string; checkpoint_id: string } };
    checkpoint: CheckpointData;
    metadata: Record<string, unknown>;
  }> {
    const threadId = config.configurable?.thread_id;

    if (!threadId) {
      return;
    }

    try {
      const records = await ChatMessage.findAll({
        where: { sessionId: threadId, checkpointNs: '' },
        order: [['createdAt', 'DESC']],
        limit: options?.limit,
      });

      for (const record of records) {
        yield {
          config: { configurable: { thread_id: threadId, checkpoint_id: record.checkpointId || '' } },
          checkpoint: record.checkpoint as CheckpointData,
          metadata: record.metadata as Record<string, unknown>,
        };
      }
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error listing checkpoints:', error);
    }
  }

  /**
   * 存储中间写入（实现为空）
   */
  async putWrites(
    _config: { configurable: { thread_id?: string } },
    _writes: Array<[string, string, unknown]>,
    _taskId: string,
  ): Promise<void> {
    // 简化实现：不需要单独存储 writes
    logger.debug('[MySQLCheckpointSaver] putWrites called (ignored)');
  }

  /**
   * 删除指定线程的所有 checkpoint
   */
  async deleteThread(threadId: string): Promise<void> {
    if (!threadId) {
      return;
    }

    try {
      await ChatMessage.destroy({
        where: { sessionId: threadId },
      });

      logger.info(`[MySQLCheckpointSaver] Deleted all checkpoints for thread: ${threadId}`);
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error deleting checkpoints:', error);
      throw error;
    }
  }
}

// 创建单例
let checkpointSaverInstance: MySQLCheckpointSaver | null = null;

/**
 * 获取 MySQLCheckpointSaver 单例
 */
export const getCheckpointSaver = (): MySQLCheckpointSaver => {
  if (!checkpointSaverInstance) {
    checkpointSaverInstance = new MySQLCheckpointSaver();
  }
  return checkpointSaverInstance;
};

export type { CheckpointData };
