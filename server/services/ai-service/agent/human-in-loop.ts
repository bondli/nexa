import logger from 'electron-log';

/**
 * Human-in-the-loop 状态
 */
export interface HumanInTheLoopState {
  sessionId: string;
  pendingToolCall: {
    toolName: string;
    toolArgs: Record<string, unknown>;
    requestId: string;
  };
  checkpoint: Record<string, unknown>;
}

/**
 * 等待用户输入的任务
 */
export interface PendingTask {
  id: string;
  sessionId: string;
  toolName: string;
  toolArgs: Record<string, unknown>;
  message: string;
  createdAt: Date;
}

/**
 * Human-in-the-loop 管理器
 */
export class HumanInTheLoopManager {
  private pendingTasks: Map<string, PendingTask> = new Map();
  private checkpoints: Map<string, Record<string, unknown>> = new Map();

  /**
   * 创建等待用户输入的任务
   */
  createPendingTask(
    sessionId: string,
    toolName: string,
    toolArgs: Record<string, unknown>,
    message: string,
  ): PendingTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const task: PendingTask = {
      id: taskId,
      sessionId,
      toolName,
      toolArgs,
      message,
      createdAt: new Date(),
    };

    this.pendingTasks.set(taskId, task);
    logger.info(`[HumanInTheLoop] 创建待处理任务: ${taskId}, tool: ${toolName}`);

    return task;
  }

  /**
   * 获取待处理任务
   */
  getPendingTask(taskId: string): PendingTask | undefined {
    return this.pendingTasks.get(taskId);
  }

  /**
   * 获取会话的所有待处理任务
   */
  getPendingTasksBySession(sessionId: string): PendingTask[] {
    return Array.from(this.pendingTasks.values()).filter((task) => task.sessionId === sessionId);
  }

  /**
   * 用户响应后继续执行
   */
  async continueWithUserInput(
    taskId: string,
    userInput: Record<string, unknown>,
  ): Promise<{ toolName: string; toolArgs: Record<string, unknown> } | null> {
    const task = this.pendingTasks.get(taskId);

    if (!task) {
      logger.warn(`[HumanInTheLoop] 任务不存在: ${taskId}`);
      return null;
    }

    // 合并用户输入到工具参数
    const mergedArgs = {
      ...task.toolArgs,
      ...userInput,
    };

    // 删除任务
    this.pendingTasks.delete(taskId);
    logger.info(`[HumanInTheLoop] 用户已响应，任务继续: ${taskId}`);

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
      logger.warn(`[HumanInTheLoop] 任务不存在: ${taskId}`);
      return false;
    }

    this.pendingTasks.delete(taskId);
    logger.info(`[HumanInTheLoop] 用户拒绝，任务取消: ${taskId}`);

    return true;
  }

  /**
   * 保存检查点
   */
  saveCheckpoint(sessionId: string, checkpoint: Record<string, unknown>): void {
    this.checkpoints.set(sessionId, checkpoint);
    logger.info(`[HumanInTheLoop] 检查点已保存: ${sessionId}`);
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
    logger.info(`[HumanInTheLoop] 检查点已删除: ${sessionId}`);
  }

  /**
   * 检查是否有待处理任务
   */
  hasPendingTasks(sessionId: string): boolean {
    return this.getPendingTasksBySession(sessionId).length > 0;
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
      this.pendingTasks.delete(taskId);
    }

    // 删除检查点
    this.checkpoints.delete(sessionId);

    logger.info(`[HumanInTheLoop] 会话状态已清理: ${sessionId}`);
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