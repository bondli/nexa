import { getSkillRegistry, createSkill } from './registry';
import logger from 'electron-log';

/**
 * 获取当前日期时间
 */
const getDateTimeSkill = createSkill(
  'get_datetime',
  '获取当前日期和时间',
  {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        description: '日期格式，如 "YYYY-MM-DD HH:mm:ss"',
        enum: ['YYYY-MM-DD', 'HH:mm:ss', 'YYYY-MM-DD HH:mm:ss', 'timestamp'],
      },
    },
    required: [],
  },
  async (params) => {
    const format = (params.format as string) || 'YYYY-MM-DD HH:mm:ss';
    const now = new Date();

    if (format === 'timestamp') {
      return JSON.stringify({ success: true, result: now.getTime() });
    }

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let result = format;
    result = result.replace('YYYY', String(year));
    result = result.replace('MM', month);
    result = result.replace('DD', day);
    result = result.replace('HH', hours);
    result = result.replace('mm', minutes);
    result = result.replace('ss', seconds);

    return JSON.stringify({ success: true, result });
  },
);

/**
 * 计算器
 */
const calculatorSkill = createSkill(
  'calculator',
  '执行数学计算',
  {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: '数学表达式，如 "2+2", "10*5", "sqrt(16)"',
      },
    },
    required: ['expression'],
  },
  async (params) => {
    const expression = params.expression as string;

    try {
      // 安全计算：只允许数字和运算符
      if (!/^[\d+\-*/().\s]+$/.test(expression)) {
        return JSON.stringify({ success: false, error: 'Invalid expression' });
      }

      // 使用 Function 计算结果（比 eval 安全，但仍需谨慎）
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${expression}`)();

      return JSON.stringify({ success: true, result });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
);

/**
 * 字符串处理
 */
const stringProcessorSkill = createSkill(
  'string_processor',
  '处理字符串，如转换大小写、去除空格等',
  {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: '操作类型',
        enum: ['uppercase', 'lowercase', 'trim', 'length', 'reverse'],
      },
      text: {
        type: 'string',
        description: '输入文本',
      },
    },
    required: ['operation', 'text'],
  },
  async (params) => {
    const { operation, text } = params;

    if (typeof text !== 'string') {
      return JSON.stringify({ success: false, error: 'Text must be a string' });
    }

    let result: unknown;

    switch (operation) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'trim':
        result = text.trim();
        break;
      case 'length':
        result = text.length;
        break;
      case 'reverse':
        result = text.split('').reverse().join('');
        break;
      default:
        return JSON.stringify({ success: false, error: `Unknown operation: ${operation}` });
    }

    return JSON.stringify({ success: true, result });
  },
);

/**
 * 获取所有内置 Skill
 */
export const getBuiltInSkills = () => [getDateTimeSkill, calculatorSkill, stringProcessorSkill];

/**
 * 注册所有内置 Skill
 */
export const registerBuiltInSkills = (): void => {
  const registry = getSkillRegistry();
  const skills = getBuiltInSkills();
  registry.installSkills(skills);
  logger.info('[BuiltInSkills] Registered', skills.length, 'built-in skills');
};
