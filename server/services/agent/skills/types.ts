/**
 * Skill 参数定义
 */
export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
  enum?: unknown[];
}

/**
 * Skill 定义
 */
export interface SkillSpec {
  name: string;
  description: string;
  parameters: SkillParameter[];
  category?: string;
  version?: string;
}

/**
 * Skill 安装请求
 */
export interface InstallSkillRequest {
  name: string;
  description: string;
  parameters: SkillParameter[];
  handlerCode: string;
}

/**
 * Skill 执行上下文
 */
export interface SkillExecutionContext {
  sessionId: string;
  userId: number;
  skillName: string;
  params: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Skill 执行结果
 */
export interface SkillExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * 转换为 JSON Schema
 */
export const skillParametersToJsonSchema = (
  parameters: SkillParameter[],
): Record<string, unknown> => {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const param of parameters) {
    properties[param.name] = {
      type: param.type,
      description: param.description,
    };

    if (param.enum) {
      (properties[param.name] as Record<string, unknown>).enum = param.enum;
    }

    if (param.default !== undefined) {
      (properties[param.name] as Record<string, unknown>).default = param.default;
    }

    if (param.required) {
      required.push(param.name);
    }
  }

  return {
    type: 'object',
    properties,
    required,
  };
};

/**
 * 从 JSON Schema 转换为 Skill 参数
 */
export const jsonSchemaToSkillParameters = (
  schema: Record<string, unknown>,
): SkillParameter[] => {
  const parameters: SkillParameter[] = [];
  const properties = (schema.properties as Record<string, unknown>) || {};
  const required = (schema.required as string[]) || [];

  for (const [name, prop] of Object.entries(properties)) {
    const p = prop as Record<string, unknown>;
    parameters.push({
      name,
      type: (p.type as SkillParameter['type']) || 'string',
      description: (p.description as string) || '',
      required: required.includes(name),
      default: p.default,
      enum: p.enum as unknown[],
    });
  }

  return parameters;
};
