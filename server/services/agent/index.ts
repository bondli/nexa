// Agent 核心模块导出

// 类型定义
export type {
  AgentConfig,
  ChatMessage,
  StreamCallback,
  ToolCall,
  ToolResult,
  SkillDefinition,
  SkillHandler,
  ToolDefinition,
  RetrievalResult,
  RAGConfig,
  HumanTask,
  CompressionResult,
  AgentResult,
  CheckpointMetadata,
} from './types';

// 日志配置
export { configureLangChainLogging, logAgentExecution, logAgentError, logToolCall, logRetrieval } from './logging';

// 工具系统
export { getToolRegistry, getBuiltInTools, registerBuiltInTools } from './tools';
export { default as ToolConverter } from './tools/converter';
export { BaseTool, ToolParameterValidator } from './tools/base';

// Skill 系统
export { getSkillRegistry, createSkill, getBuiltInSkills, registerBuiltInSkills } from './skills';
export type {
  SkillParameter,
  SkillSpec,
  InstallSkillRequest,
  SkillExecutionContext,
  SkillExecutionResult,
} from './skills/types';
export { skillParametersToJsonSchema, jsonSchemaToSkillParameters } from './skills/types';

// Human-in-the-loop
export { getHumanInTheLoopManager } from './human-in-loop';
export type {
  HumanTaskStatus,
  ProvideParamsRequest,
  HumanInTheLoopEvent,
  HumanInTheLoopConfig,
} from './human-in-loop/types';

// 记忆与持久化
export { getMessageHistoryManager, getContextCompressor } from './memory';
export type { CompressionConfig } from './memory/compressor';

// RAG 检索
export { getRetrievalService } from './rag';
export type { RAGServiceConfig } from './rag/retrieval';

// Agent 核心
export { createAgent } from './agent';
export { default as Agent } from './agent';

// Agent 管理器
export { getAgentManager } from './manager';

// LLM 配置
export { loadLLMConfig, getDefaultBaseUrl } from './llm-config';
export type { LLMConfig } from './llm-config';
