import { DynamicTool, Tool } from '@langchain/core/tools';
import type { ToolDefinition } from '../types';

/**
 * 工具到 LangChain Tool 的转换器
 */
class ToolConverter {
  /**
   * 将单个工具转换为 LangChain Tool
   */
  static toLangChainTool(tool: ToolDefinition): DynamicTool {
    return new DynamicTool({
      name: tool.name,
      description: tool.description,
      func: async (input: string): Promise<string> => {
        try {
          const params = input ? JSON.parse(input) : {};
          const result = await tool.execute(params);
          return result.success ? result.result || '' : JSON.stringify({ error: result.error });
        } catch (error) {
          return JSON.stringify({ error: String(error) });
        }
      },
    });
  }

  /**
   * 将工具列表转换为 LangChain Tool 数组
   */
  static toLangChainTools(tools: ToolDefinition[]): DynamicTool[] {
    return tools.map((tool) => this.toLangChainTool(tool));
  }

  /**
   * 将工具转换为结构化描述（用于系统提示）
   */
  static toStructuredDescription(tools: ToolDefinition[]): string {
    return tools
      .map((tool) => {
        const paramsDesc = this.formatParameters(tool.parameters);
        return `## ${tool.name}

${tool.description}

Parameters:
${paramsDesc}`;
      })
      .join('\n\n');
  }

  /**
   * 格式化参数描述
   */
  private static formatParameters(schema: Record<string, unknown>): string {
    const properties = (schema.properties as Record<string, unknown>) || {};
    const required = (schema.required as string[]) || [];

    if (Object.keys(properties).length === 0) {
      return '  (no parameters)';
    }

    return Object.entries(properties)
      .map(([key, value]) => {
        const prop = value as Record<string, unknown>;
        const isRequired = required.includes(key);
        const type = prop.type || 'any';
        const desc = prop.description || '';

        return `  - ${key}${isRequired ? ' *' : ''} (${type}): ${desc}`;
      })
      .join('\n');
  }

  /**
   * 解析 LLM 返回的工具调用
   */
  static parseToolCalls(response: string): Array<{ name: string; arguments: Record<string, unknown> }> {
    const toolCalls: Array<{ name: string; arguments: Record<string, unknown> }> = [];

    // 尝试解析 JSON 格式
    try {
      // 匹配 ```json ... ``` 块
      const jsonMatch = response.match(/```json\s*(\[[\s\S]*?\])\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }

      // 尝试直接解析 JSON
      const directParse = JSON.parse(response);
      if (Array.isArray(directParse)) {
        return directParse;
      }
      if (typeof directParse === 'object' && directParse !== null) {
        return [directParse];
      }
    } catch {
      // 忽略解析错误，尝试其他格式
    }

    // 尝试匹配函数调用格式: toolName(arg1=value1, arg2=value2)
    const funcMatch = response.match(/(\w+)\(([\s\S]*?)\)/g);
    if (funcMatch) {
      for (const match of funcMatch) {
        const nameMatch = match.match(/^(\w+)\(/);
        if (nameMatch) {
          const name = nameMatch[1];
          const argsStr = match.slice(name.length + 1, -1);
          const args = this.parseArguments(argsStr);
          toolCalls.push({ name, arguments: args });
        }
      }
    }

    return toolCalls;
  }

  /**
   * 解析参数字符串
   */
  private static parseArguments(argsStr: string): Record<string, unknown> {
    const args: Record<string, unknown> = {};

    // 简单的 key=value 解析
    const pairs = argsStr.split(',').map((s) => s.trim());
    for (const pair of pairs) {
      const equalIndex = pair.indexOf('=');
      if (equalIndex > 0) {
        const key = pair.slice(0, equalIndex).trim();
        let value: unknown = pair.slice(equalIndex + 1).trim();

        // 尝试解析 JSON 值
        try {
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
          else if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        } catch {
          // 保持原值
        }

        args[key] = value;
      }
    }

    return args;
  }
}

export default ToolConverter;
