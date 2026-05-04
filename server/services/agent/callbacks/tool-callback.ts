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

  constructor(extendedCallback?: ExtendedStreamCallback) {
    super();
    this.extendedCallback = extendedCallback;
  }

  /**
   * 当工具执行开始时触发
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToolStart(tool: any, input: any, runId: string, parentRunId?: string): void {
    // 尝试从不同属性获取工具名称
    const toolName = tool?.name || tool?.id || tool?._name || 'unknown';
    const args = typeof input === 'string' ? { query: input } : input;

    logger.info(`[ToolCallback] Tool start: ${toolName}`, args);
    logger.info(`[ToolCallback] Tool object:`, JSON.stringify(tool).substring(0, 200));

    // 发送工具调用开始事件
    if (this.extendedCallback) {
      this.extendedCallback({
        type: 'tool_call',
        data: {
          tool_call: {
            tool: toolName,
            params: args as Record<string, unknown>,
          },
        },
      });

      this.extendedCallback({
        type: 'tool_start',
        data: {
          tool_start: {
            tool: toolName,
            message: `正在执行 ${toolName}...`,
          },
        },
      });
    }
  }

  /**
   * 当工具执行完成时触发
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleToolEnd(output: any, runId: string, parentRunId?: string): void {
    const resultStr = typeof output === 'string' ? output : JSON.stringify(output);

    logger.info(`[ToolCallback] Tool end:`, resultStr.substring(0, 200));

    // 发送工具结果事件
    if (this.extendedCallback) {
      this.extendedCallback({
        type: 'tool_result',
        data: {
          tool_result: {
            tool: '',
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
            tool: '',
            error: errorMsg,
          },
        },
      });
    }
  }
}

export default ToolExecutionCallbackHandler;
