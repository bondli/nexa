/**
 * Human Task 状态
 */
export type HumanTaskStatus = 'pending' | 'completed' | 'cancelled' | 'expired';

/**
 * Human-in-the-loop 事件
 */
export type HumanInTheLoopEvent =
  | { type: 'TASK_CREATED'; task: import('../types').HumanTask }
  | { type: 'TASK_COMPLETED'; taskId: string; result: unknown }
  | { type: 'TASK_CANCELLED'; taskId: string }
  | { type: 'TASK_EXPIRED'; taskId: string };

/**
 * Human-in-the-loop 配置
 */
export interface HumanInTheLoopConfig {
  enabled: boolean;
  defaultTimeoutMs: number;
  maxConcurrentTasks: number;
  notificationCallback?: (event: HumanInTheLoopEvent) => void;
}

/**
 * Human-in-the-loop 补充参数请求
 */
export interface ProvideParamsRequest {
  taskId: string;
  params: Record<string, unknown>;
}
