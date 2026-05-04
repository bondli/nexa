/**
 * 沙箱运行环境
 * 提供独立的系统工具执行环境，支持文件读写、文档解析等操作
 */
export { getSandboxExecutor, default as SandboxExecutor } from './executor';
export type { SandboxResult, SandboxToolParams } from './executor';
