import { QueryTypes } from 'sequelize';
import sequelize from '../../../config/database';
import logger from 'electron-log';

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
 * MySQL Checkpoint Saver - 简化版本
 * 将对话消息存储到 MySQL checkpoints 表
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
      await sequelize.query(
        `INSERT INTO checkpoints (thread_id, checkpoint_ns, checkpoint_id, checkpoint, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE checkpoint = VALUES(checkpoint), metadata = VALUES(metadata), created_at = VALUES(created_at)`,
        {
          replacements: [
            threadId,
            checkpointNs,
            checkpointId,
            JSON.stringify(checkpoint),
            JSON.stringify(metadata),
            new Date(),
          ],
          type: QueryTypes.INSERT,
        }
      );

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
  async get(
    config: { configurable: { thread_id?: string; checkpoint_id?: string } },
  ): Promise<CheckpointData | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) {
      return undefined;
    }

    try {
      let query: string;
      let replacements: string[];

      if (checkpointId) {
        query = `SELECT checkpoint FROM checkpoints
                 WHERE thread_id = ? AND checkpoint_ns = '' AND checkpoint_id = ?
                 ORDER BY created_at DESC LIMIT 1`;
        replacements = [threadId, checkpointId];
      } else {
        query = `SELECT checkpoint FROM checkpoints
                 WHERE thread_id = ? AND checkpoint_ns = ''
                 ORDER BY created_at DESC LIMIT 1`;
        replacements = [threadId];
      }

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      if (results.length === 0) {
        return undefined;
      }

      const row = results[0] as { checkpoint: CheckpointData };
      return row.checkpoint;
    } catch (error) {
      logger.error('[MySQLCheckpointSaver] Error getting checkpoint:', error);
      return undefined;
    }
  }

  /**
   * 获取 checkpoint 元组
   */
  async getTuple(
    config: { configurable: { thread_id?: string; checkpoint_id?: string } },
  ): Promise<{
    config: { configurable: { thread_id: string; checkpoint_id: string } };
    checkpoint: CheckpointData;
    metadata: Record<string, unknown>;
  } | undefined> {
    const threadId = config.configurable?.thread_id;
    const checkpointId = config.configurable?.checkpoint_id;

    if (!threadId) {
      return undefined;
    }

    try {
      let query: string;
      let replacements: string[];

      if (checkpointId) {
        query = `SELECT checkpoint_id, checkpoint, metadata FROM checkpoints
                 WHERE thread_id = ? AND checkpoint_ns = '' AND checkpoint_id = ?
                 ORDER BY created_at DESC LIMIT 1`;
        replacements = [threadId, checkpointId];
      } else {
        query = `SELECT checkpoint_id, checkpoint, metadata FROM checkpoints
                 WHERE thread_id = ? AND checkpoint_ns = ''
                 ORDER BY created_at DESC LIMIT 1`;
        replacements = [threadId];
      }

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      if (results.length === 0) {
        return undefined;
      }

      const row = results[0] as {
        checkpoint_id: string;
        checkpoint: CheckpointData;
        metadata: Record<string, unknown>;
      };

      return {
        config: { configurable: { thread_id: threadId, checkpoint_id: row.checkpoint_id } },
        checkpoint: row.checkpoint,
        metadata: row.metadata,
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
      let query = `SELECT checkpoint_id, checkpoint, metadata FROM checkpoints
                   WHERE thread_id = ? AND checkpoint_ns = ''`;

      const replacements: string[] = [threadId];

      if (options?.limit) {
        query += ` ORDER BY created_at DESC LIMIT ?`;
        replacements.push(String(options.limit));
      } else {
        query += ` ORDER BY created_at DESC`;
      }

      const results = await sequelize.query(query, {
        replacements,
        type: QueryTypes.SELECT,
      });

      for (const row of results) {
        const r = row as {
          checkpoint_id: string;
          checkpoint: CheckpointData;
          metadata: Record<string, unknown>;
        };

        yield {
          config: { configurable: { thread_id: threadId, checkpoint_id: r.checkpoint_id } },
          checkpoint: r.checkpoint,
          metadata: r.metadata,
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
      await sequelize.query(`DELETE FROM checkpoints WHERE thread_id = ?`, {
        replacements: [threadId],
        type: QueryTypes.DELETE,
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