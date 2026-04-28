import { DynamicTool } from '@langchain/core/tools';
import logger from 'electron-log';
import type { ToolDefinition, ToolResult } from '../types';
import { logToolCall } from '../logging';

/**
 * 工具注册表 - 管理所有可用工具
 */
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private langchainTools: Map<string, DynamicTool> = new Map();

  /**
   * 注册工具
   */
  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      logger.warn(`[ToolRegistry] Tool ${tool.name} already exists, overwriting`);
    }

    this.tools.set(tool.name, tool);

    // 转换为 LangChain Tool
    const lcTool = new DynamicTool({
      name: tool.name,
      description: tool.description,
      func: async (input: string): Promise<string> => {
        try {
          // 尝试解析 JSON，如果失败则直接将 input 作为参数
          let params: Record<string, unknown>;
          if (input) {
            try {
              params = JSON.parse(input);
            } catch {
              // 如果不是 JSON 格式，则尝试直接使用 input 作为 searchQuery
              // 这处理 LangChain 直接传递字符串而非 JSON 的情况
              params = { searchQuery: input };
            }
          } else {
            params = {};
          }
          const result = await tool.execute(params);
          return result.success ? result.result || '' : result.error || 'Tool execution failed';
        } catch (error) {
          logger.error(`[ToolRegistry] Tool ${tool.name} execution error:`, error);
          return JSON.stringify({ success: false, error: String(error) });
        }
      },
    });

    this.langchainTools.set(tool.name, lcTool);
    logger.info(`[ToolRegistry] Registered tool: ${tool.name}`);
  }

  /**
   * 批量注册工具
   */
  registerTools(tools: ToolDefinition[]): void {
    tools.forEach((tool) => this.registerTool(tool));
  }

  /**
   * 获取工具
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取所有 LangChain 工具
   */
  getLangChainTools(): DynamicTool[] {
    return Array.from(this.langchainTools.values());
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 移除工具
   */
  unregisterTool(name: string): boolean {
    const existed = this.tools.has(name);
    this.tools.delete(name);
    this.langchainTools.delete(name);
    if (existed) {
      logger.info(`[ToolRegistry] Unregistered tool: ${name}`);
    }
    return existed;
  }

  /**
   * 清空所有工具
   */
  clear(): void {
    this.tools.clear();
    this.langchainTools.clear();
    logger.info('[ToolRegistry] Cleared all tools');
  }

  /**
   * 获取工具列表（用于系统提示）
   */
  getToolsDescription(): string {
    return Array.from(this.tools.values())
      .map((t) => `- ${t.name}: ${t.description}`)
      .join('\n');
  }

  /**
   * 执行工具
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    const tool = this.tools.get(name);

    if (!tool) {
      return { success: false, error: `Unknown tool: ${name}` };
    }

    try {
      logToolCall(name, args);
      const result = await tool.execute(args);
      return result;
    } catch (error) {
      logger.error(`[ToolRegistry] Tool ${name} execution error:`, error);
      return { success: false, error: String(error) };
    }
  }
}

// 全局单例
let toolRegistry: ToolRegistry | null = null;

/**
 * 获取工具注册表实例
 */
export const getToolRegistry = (): ToolRegistry => {
  if (!toolRegistry) {
    toolRegistry = new ToolRegistry();
  }
  return toolRegistry;
};

export default ToolRegistry;
