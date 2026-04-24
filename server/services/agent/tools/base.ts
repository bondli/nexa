import type { ToolDefinition, ToolResult } from '../types';

/**
 * 工具参数验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  missingParams?: string[];
}

/**
 * 基础工具抽象类
 */
export abstract class BaseTool implements ToolDefinition {
  abstract name: string;
  abstract description: string;
  abstract parameters: Record<string, unknown>;

  /**
   * 执行工具
   */
  abstract execute(params: Record<string, unknown>): Promise<ToolResult>;

  /**
   * 验证参数
   */
  validateParams(params: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const missingParams: string[] = [];

    const required = this.parameters.required as string[] || [];

    for (const field of required) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        missingParams.push(field);
        errors.push(`Missing required parameter: ${field}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      missingParams,
    };
  }

  /**
   * 获取参数 schema
   */
  getParametersSchema(): Record<string, unknown> {
    return this.parameters;
  }

  /**
   * 转换为工具定义
   */
  toToolDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      execute: this.execute.bind(this),
    };
  }
}

/**
 * 工具参数验证器
 */
export class ToolParameterValidator {
  /**
   * 使用 JSON Schema 验证参数
   */
  static validate(params: Record<string, unknown>, schema: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];
    const missingParams: string[] = [];

    const required = (schema.required as string[]) || [];
    const properties = (schema.properties as Record<string, unknown>) || {};

    // 检查必需参数
    for (const field of required) {
      if (params[field] === undefined || params[field] === null || params[field] === '') {
        missingParams.push(field);
        errors.push(`Missing required parameter: ${field}`);
      }
    }

    // 检查参数类型
    for (const [key, value] of Object.entries(params)) {
      const propSchema = properties[key] as Record<string, unknown> | undefined;
      if (propSchema && value !== undefined && value !== null) {
        const type = propSchema.type as string;
        if (type && !this.checkType(value, type)) {
          errors.push(`Parameter ${key} expected type ${type}, got ${typeof value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      missingParams,
    };
  }

  /**
   * 检查类型
   */
  private static checkType(value: unknown, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }
}

export default BaseTool;
