/**
 * Agent 配置接口
 */
export interface AgentConfig {
  sessionId: string;
  useTools?: boolean;
  useRAG?: boolean;
  knowledgeIds?: number[];
  maxRecentMessages?: number;
  summaryMaxTokens?: number;
  enableHumanInLoop?: boolean;
  timeout?: number;
  systemMessage?: string;
}

/**
 * 消息类型
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

/**
 * 流式回调类型
 */
export interface StreamCallback {
  (content: string, done: boolean, toolCalls?: string[]): void;
}

/**
 * 工具调用类型
 */
export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
  id?: string;
}

/**
 * 工具执行结果
 */
export interface ToolResult {
  success: boolean;
  result?: string;
  error?: string;
}

/**
 * Skill 定义接口
 */
export interface SkillDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: SkillHandler;
}

/**
 * Skill 处理函数
 */
export type SkillHandler = (params: Record<string, unknown>) => Promise<string>;

/**
 * 工具定义接口
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

/**
 * RAG 检索结果
 */
export interface RetrievalResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

/**
 * RAG 配置
 */
export interface RAGConfig {
  knowledgeIds: number[];
  topK?: number;
  minScore?: number;
}

/**
 * 人类介入任务
 */
export interface HumanTask {
  id: string;
  sessionId: string;
  toolName: string;
  toolArgs: Record<string, unknown>;
  missingParams: string[];
  message: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * 上下文压缩结果
 */
export interface CompressionResult {
  messages: ChatMessage[];
  summary: string;
  originalCount: number;
  compressedCount: number;
}

/**
 * Agent 执行结果
 */
export interface AgentResult {
  content: string;
  toolCalls?: ToolCall[];
  hasMore?: boolean;
}

/**
 * Checkpoint 元数据
 */
export interface CheckpointMetadata {
  thread_id: string;
  checkpoint_ns?: string;
  messageCount: number;
  createdAt: Date;
}

/**
 * 执行过程事件类型
 */
export type ExecutionEventType =
  | 'thinking'      // Agent 思考中
  | 'tool_call'      // Agent 决定调用工具
  | 'tool_start'     // 工具开始执行
  | 'tool_result'    // 工具执行结果
  | 'tool_error'     // 工具执行错误
  | 'reasoning'      // Agent 推理过程
  | 'final';         // 最终回答

/**
 * 执行过程事件数据
 */
export interface ExecutionEventData {
  thinking?: {
    message: string;
  };
  tool_call?: {
    tool: string;
    params: Record<string, unknown>;
  };
  tool_start?: {
    tool: string;
    message: string;
  };
  tool_result?: {
    tool: string;
    success: boolean;
    result?: string;
    error?: string;
  };
  tool_error?: {
    tool: string;
    error: string;
  };
  reasoning?: {
    thought: string;
  };
  final?: {
    content: string;
  };
}

/**
 * 执行过程事件
 */
export interface ExecutionEvent {
  type: ExecutionEventType;
  data: ExecutionEventData;
}

/**
 * 扩展的流式回调类型（支持多事件类型）
 */
export interface ExtendedStreamCallback {
  (event: ExecutionEvent): void;
}
