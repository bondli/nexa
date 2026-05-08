import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import logger from 'electron-log';
import type { ExtendedStreamCallback } from '../types';

/**
 * 自定义工具回调处理器
 * 用于捕获 LangChain Agent 的工具调用和执行结果
 */
export class ToolExecutionCallbackHandler extends BaseCallbackHandler {
  name = 'tool_execution_handler';

  private extendedCallback?: ExtendedStreamCallback;
  private currentToolName: string = '';

  constructor(extendedCallback?: ExtendedStreamCallback) {
    super();
    this.extendedCallback = extendedCallback;
  }

  /**
   * 当工具执行开始时触发
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToolStart(tool: any, input: any, runId: string, parentRunId?: string): void {
    let toolName = 'unknown';

    if (tool) {
      // 直接检查标准 name 属性（DynamicTool 应该有这个）
      if (typeof tool.name === 'string' && tool.name !== 'DynamicTool') {
        toolName = tool.name;
      }
      // 检查自定义的 toolName 属性
      else if (typeof tool.toolName === 'string') {
        toolName = tool.toolName;
      }
      // DynamicTool 内部将名称存储在 _name 属性中
      else if (typeof tool._name === 'string') {
        toolName = tool._name;
      }
      // id 可能是字符串
      else if (typeof tool.id === 'string' && tool.id !== 'DynamicTool') {
        toolName = tool.id;
      }
      // id 可能是数组，从中提取实际名称
      else if (Array.isArray(tool.id) && tool.id.length > 0) {
        for (let i = tool.id.length - 1; i >= 0; i--) {
          const item = tool.id[i];
          if (item && typeof item === 'string' && !['langchain', 'tools', 'DynamicTool', 'unknown'].includes(item)) {
            toolName = item;
            break;
          }
        }
      }

      // 尝试从 func 的名称推断
      if (toolName === 'unknown' && tool.func) {
        if (typeof tool.func.name === 'string' && tool.func.name !== 'anonymous') {
          toolName = tool.func.name;
        }
      }

      // 尝试从 func 的 displayName 推断
      if (toolName === 'unknown' && tool.func) {
        if (typeof (tool.func as any).displayName === 'string') {
          toolName = (tool.func as any).displayName;
        }
      }
    }

    this.currentToolName = toolName;

    // 解析 input 参数（仅用于存储，当前不需要发送）
    // 注意：tool_call 和 tool_start 事件已在 chatWithTools 中正确发送
    const args = typeof input === 'string' ? { input } : input;
    if (typeof input === 'string') {
      try {
        JSON.parse(input);
      } catch {
        // ignore
      }
    }
  }

  /**
   * 当工具执行完成时触发
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToolEnd(output: any, runId: string, parentRunId?: string): void {
    const resultStr = typeof output === 'string' ? output : JSON.stringify(output);

    // 发送工具结果事件
    if (this.extendedCallback) {
      this.extendedCallback({
        type: 'tool_result',
        data: {
          tool_result: {
            tool: this.currentToolName,
            success: true,
            result: resultStr,
          },
        },
      });
    }
  }

  /**
   * 当工具执行出错时触发
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToolError(err: any, runId?: string, parentRunId?: string): void {
    const errorMsg = err instanceof Error ? err.message : String(err);

    logger.error(`[ToolCallback] Tool error:`, errorMsg);

    if (this.extendedCallback) {
      this.extendedCallback({
        type: 'tool_error',
        data: {
          tool_error: {
            tool: this.currentToolName,
            error: errorMsg,
          },
        },
      });
    }
  }
}

export default ToolExecutionCallbackHandler;
