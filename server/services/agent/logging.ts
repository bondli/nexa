import logger from 'electron-log';

/**
 * LangChain 日志配置
 */
export const configureLangChainLogging = (): void => {
  // 设置 langchain 日志级别
  if (process.env.LANGCHAIN_VERBOSE === 'true') {
    // 启用 verbose 模式
    logger.info('[LangChain] Verbose mode enabled');
  }

  // 设置全局错误处理
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('[LangChain] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    logger.error('[LangChain] Uncaught Exception:', error);
  });

  logger.info('[LangChain] Logging configured');
};

/**
 * Agent 执行日志
 */
export const logAgentExecution = (
  sessionId: string,
  step: string,
  data?: Record<string, unknown>,
): void => {
  logger.info(`[Agent:${sessionId}] ${step}`, data || '');
};

/**
 * Agent 错误日志
 */
export const logAgentError = (
  sessionId: string,
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  logger.error(`[Agent:${sessionId}] Error:`, error, context || '');
};

/**
 * 工具调用日志
 */
export const logToolCall = (
  toolName: string,
  args: Record<string, unknown>,
  result?: unknown,
): void => {
  logger.info(`[Tool] ${toolName} called with:`, args);
  if (result) {
    logger.info(`[Tool] ${toolName} result:`, result);
  }
};

/**
 * RAG 检索日志
 */
export const logRetrieval = (
  sessionId: string,
  query: string,
  resultsCount: number,
  knowledgeIds: number[],
): void => {
  logger.info(`[RAG:${sessionId}] Query: "${query}", Found ${resultsCount} results from knowledgeIds:`, knowledgeIds);
};
