import type { Request, Response } from 'express';
import { getHumanInTheLoopManager } from './manager';
import { success, notFound, badRequest, serverError } from '../../../utils/response';
import logger from 'electron-log';

/**
 * 获取会话的待处理任务列表
 */
export const getPendingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      badRequest(res, 'sessionId is required');
      return;
    }

    const manager = getHumanInTheLoopManager();
    const tasks = manager.getPendingTasksBySession(sessionId as string);

    const taskList = tasks.map((task) => ({
      id: task.id,
      toolName: task.toolName,
      toolArgs: task.toolArgs,
      missingParams: task.missingParams,
      message: task.message,
      createdAt: task.createdAt,
      expiresAt: task.expiresAt,
    }));

    success(res, taskList);
  } catch (error) {
    logger.error('[HumanInLoopController] Error getting pending tasks:', error);
    serverError(res, 'Error getting pending tasks');
  }
};

/**
 * 补充参数继续执行
 */
export const provideParams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, params } = req.body;

    if (!taskId || !params) {
      badRequest(res, 'taskId and params are required');
      return;
    }

    const manager = getHumanInTheLoopManager();
    const result = await manager.continueWithUserInput(taskId, params);

    if (result) {
      success(res, {
        continued: true,
        toolName: result.toolName,
        toolArgs: result.toolArgs,
      });
    } else {
      notFound(res, 'Task not found or already completed');
    }
  } catch (error) {
    logger.error('[HumanInLoopController] Error providing params:', error);
    serverError(res, 'Error providing params');
  }
};

/**
 * 取消待处理任务
 */
export const cancelTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      badRequest(res, 'taskId is required');
      return;
    }

    const manager = getHumanInTheLoopManager();
    const cancelled = manager.cancelPendingTask(taskId);

    if (cancelled) {
      success(res, { cancelled: true, taskId });
    } else {
      notFound(res, 'Task not found');
    }
  } catch (error) {
    logger.error('[HumanInLoopController] Error cancelling task:', error);
    serverError(res, 'Error cancelling task');
  }
};

/**
 * 获取任务详情
 */
export const getTaskDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      badRequest(res, 'taskId is required');
      return;
    }

    const manager = getHumanInTheLoopManager();
    const task = manager.getPendingTask(taskId);

    if (task) {
      success(res, task);
    } else {
      notFound(res, 'Task not found');
    }
  } catch (error) {
    logger.error('[HumanInLoopController] Error getting task detail:', error);
    serverError(res, 'Error getting task detail');
  }
};

/**
 * 清理会话状态
 */
export const cleanupSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      badRequest(res, 'sessionId is required');
      return;
    }

    const manager = getHumanInTheLoopManager();
    manager.cleanupSession(sessionId);

    success(res, { cleaned: true, sessionId });
  } catch (error) {
    logger.error('[HumanInLoopController] Error cleaning up session:', error);
    serverError(res, 'Error cleaning up session');
  }
};
