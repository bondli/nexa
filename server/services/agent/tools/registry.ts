import { DynamicTool } from '@langchain/core/tools';
import logger from 'electron-log';
import type { ToolDefinition, ToolResult } from '../types';
import { logToolCall } from '../logging';

/**
 * 自定义工具类，扩展 DynamicTool
 * 添加 toolName 属性，以便在回调中获取实际工具名称
 */
class NamedDynamicTool extends DynamicTool {
  toolName: string;

  constructor(toolName: string, description: string, func: (input: string) => Promise<string>) {
    super({
      name: toolName,
      description,
      func,
    });
    this.toolName = toolName;
  }
}

/**
 * 工具注册表 - 管理所有可用工具
 */
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private langchainTools: Map<string, NamedDynamicTool> = new Map();
  private userId: number = 0;

  /**
   * 设置当前用户 ID（从请求头获取）
   */
  setUserId(userId: number): void {
    this.userId = userId;
    logger.info(`[ToolRegistry] UserId set to: ${userId}`);
  }

  /**
   * 获取当前用户 ID
   */
  getUserId(): number {
    return this.userId;
  }

  /**
   * 注册工具
   */
  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      logger.warn(`[ToolRegistry] Tool ${tool.name} already exists, overwriting`);
    }

    this.tools.set(tool.name, tool);

    // 保存 userId 供闭包使用
    const userId = this.userId;

    // 转换为 LangChain Tool
    const lcTool = new NamedDynamicTool(tool.name, tool.description, async (input: string): Promise<string> => {
        try {
          // 尝试解析 JSON，如果失败则直接将 input 作为参数
          let params: Record<string, unknown>;
          if (input) {
            try {
              const parsed = JSON.parse(input);
              // LangChain 传递的参数可能是 {"input": "..."} 格式
              // 需要提取出来传给工具
              if (typeof parsed === 'object' && parsed !== null && 'input' in parsed) {
                params = parsed as Record<string, unknown>;
              } else if (typeof parsed === 'object' && parsed !== null) {
                // 普通对象
                params = parsed;
              } else {
                // 原始类型（数字、布尔等），包装成对象
                params = { value: parsed };
              }
            } catch {
              // 如果不是 JSON 格式，则尝试直接使用 input 作为 searchQuery
              params = { searchQuery: input };
            }
          } else {
            params = {};
          }

          // 将 userId 注入到参数中
          params._userId = userId;

          const result = await tool.execute(params);
          return result.success ? result.result || '' : result.error || 'Tool execution failed';
        } catch (error) {
          logger.error(`[ToolRegistry] Tool ${tool.name} execution error:`, error);
          return JSON.stringify({ success: false, error: String(error) });
        }
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
  getLangChainTools(): NamedDynamicTool[] {
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
