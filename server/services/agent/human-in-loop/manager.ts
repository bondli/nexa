import type { HumanTask } from '../types';
import logger from 'electron-log';

/**
 * Human-in-the-loop 管理器
 * 处理需要人类介入的场景，如工具调用缺参
 */
class HumanInTheLoopManager {
  private pendingTasks: Map<string, HumanTask> = new Map();
  private checkpoints: Map<string, Record<string, unknown>> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  // 默认超时时间（毫秒）
  private defaultTimeout = 5 * 60 * 1000; // 5 分钟

  /**
   * 创建待处理任务
   */
  createPendingTask(
    sessionId: string,
    toolName: string,
    toolArgs: Record<string, unknown>,
    missingParams: string[],
    message?: string,
    timeout?: number,
  ): HumanTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timeoutMs = timeout || this.defaultTimeout;

    const task: HumanTask = {
      id: taskId,
      sessionId,
      toolName,
      toolArgs,
      missingParams,
      message: message || `Tool "${toolName}" requires parameters: ${missingParams.join(', ')}`,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + timeoutMs),
    };

    // 设置超时

    this.pendingTasks.set(taskId, task);

    // 设置超时
    const timeoutHandle = setTimeout(() => {
      this.handleTimeout(taskId);
    }, timeoutMs);
    this.timeouts.set(taskId, timeoutHandle);

    logger.info(`[HumanInTheLoop] Created pending task: ${taskId}, tool: ${toolName}, missing: ${missingParams.join(', ')}`);

    return task;
  }

  /**
   * 获取待处理任务
   */
  getPendingTask(taskId: string): HumanTask | undefined {
    return this.pendingTasks.get(taskId);
  }

  /**
   * 获取会话的所有待处理任务
   */
  getPendingTasksBySession(sessionId: string): HumanTask[] {
    return Array.from(this.pendingTasks.values()).filter((task) => task.sessionId === sessionId);
  }

  /**
   * 用户补充参数后继续执行
   */
  async continueWithUserInput(
    taskId: string,
    userInput: Record<string, unknown>,
  ): Promise<{ toolName: string; toolArgs: Record<string, unknown> } | null> {
    const task = this.pendingTasks.get(taskId);

    if (!task) {
      logger.warn(`[HumanInTheLoop] Task not found: ${taskId}`);
      return null;
    }

    // 清理超时
    this.clearTaskTimeout(taskId);

    // 合并参数
    const mergedArgs = {
      ...task.toolArgs,
      ...userInput,
    };

    // 删除任务
    this.pendingTasks.delete(taskId);
    logger.info(`[HumanInTheLoop] User responded, task continued: ${taskId}`);

    return {
      toolName: task.toolName,
      toolArgs: mergedArgs,
    };
  }

  /**
   * 用户拒绝提供参数
   */
  cancelPendingTask(taskId: string): boolean {
    const task = this.pendingTasks.get(taskId);

    if (!task) {
      logger.warn(`[HumanInTheLoop] Task not found: ${taskId}`);
      return false;
    }

    // 清理超时
    this.clearTaskTimeout(taskId);

    this.pendingTasks.delete(taskId);
    logger.info(`[HumanInTheLoop] User cancelled task: ${taskId}`);

    return true;
  }

  /**
   * 保存检查点
   */
  saveCheckpoint(sessionId: string, checkpoint: Record<string, unknown>): void {
    this.checkpoints.set(sessionId, checkpoint);
    logger.info(`[HumanInTheLoop] Checkpoint saved: ${sessionId}`);
  }

  /**
   * 获取检查点
   */
  getCheckpoint(sessionId: string): Record<string, unknown> | undefined {
    return this.checkpoints.get(sessionId);
  }

  /**
   * 删除检查点
   */
  deleteCheckpoint(sessionId: string): void {
    this.checkpoints.delete(sessionId);
    logger.info(`[HumanInTheLoop] Checkpoint deleted: ${sessionId}`);
  }

  /**
   * 检查是否有待处理任务
   */
  hasPendingTasks(sessionId: string): boolean {
    return this.getPendingTasksBySession(sessionId).length > 0;
  }

  /**
   * 获取待处理任务数量
   */
  getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  /**
   * 清理会话的所有状态
   */
  cleanupSession(sessionId: string): void {
    // 删除相关任务
    const tasksToDelete = Array.from(this.pendingTasks.entries()).filter(
      ([, task]) => task.sessionId === sessionId,
    );

    for (const [taskId] of tasksToDelete) {
      this.clearTaskTimeout(taskId);
      this.pendingTasks.delete(taskId);
    }

    // 删除检查点
    this.checkpoints.delete(sessionId);

    logger.info(`[HumanInTheLoop] Session cleaned up: ${sessionId}`);
  }

  /**
   * 处理超时
   */
  private handleTimeout(taskId: string): void {
    const task = this.pendingTasks.get(taskId);

    if (task) {
      logger.warn(`[HumanInTheLoop] Task timeout: ${taskId}`);
      this.pendingTasks.delete(taskId);
      this.timeouts.delete(taskId);

      // 可以在这里触发超时回调或通知
    }
  }

  /**
   * 清理任务超时
   */
  private clearTaskTimeout(taskId: string): void {
    const timeout = this.timeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(taskId);
    }
  }

  /**
   * 设置默认超时时间
   */
  setDefaultTimeout(ms: number): void {
    this.defaultTimeout = ms;
  }
}

// 全局单例
let humanInTheLoopManager: HumanInTheLoopManager | null = null;

/**
 * 获取 Human-in-the-loop 管理器实例
 */
export const getHumanInTheLoopManager = (): HumanInTheLoopManager => {
  if (!humanInTheLoopManager) {
    humanInTheLoopManager = new HumanInTheLoopManager();
  }
  return humanInTheLoopManager;
};

export default HumanInTheLoopManager;
