import type { SkillDefinition, SkillHandler } from '../types';
import { logToolCall } from '../logging';
import { getToolRegistry } from '../tools/registry';
import logger from 'electron-log';

/**
 * Skill 注册表 - 管理所有已安装的 Skill
 */
class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();

  /**
   * 安装 Skill
   */
  installSkill(skill: SkillDefinition): void {
    if (this.skills.has(skill.name)) {
      logger.warn(`[SkillRegistry] Skill ${skill.name} already exists, overwriting`);
    }

    this.skills.set(skill.name, skill);
    logger.info(`[SkillRegistry] Installed skill: ${skill.name}`);
  }

  /**
   * 批量安装 Skill
   */
  installSkills(skills: SkillDefinition[]): void {
    skills.forEach((skill) => this.installSkill(skill));
  }

  /**
   * 卸载 Skill
   */
  uninstallSkill(name: string): boolean {
    const existed = this.skills.has(name);
    this.skills.delete(name);
    if (existed) {
      logger.info(`[SkillRegistry] Uninstalled skill: ${name}`);
    }
    return existed;
  }

  /**
   * 获取 Skill
   */
  getSkill(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  /**
   * 获取所有 Skill
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }

  /**
   * 检查 Skill 是否存在
   */
  hasSkill(name: string): boolean {
    return this.skills.has(name);
  }

  /**
   * 清空所有 Skill
   */
  clear(): void {
    this.skills.clear();
    logger.info('[SkillRegistry] Cleared all skills');
  }

  /**
   * 获取 Skill 列表（用于系统提示）
   */
  getSkillsDescription(): string {
    return Array.from(this.skills.values())
      .map((s) => `- ${s.name}: ${s.description}`)
      .join('\n');
  }

  /**
   * 执行 Skill
   */
  async executeSkill(name: string, params: Record<string, unknown>): Promise<string> {
    const skill = this.skills.get(name);

    if (!skill) {
      return JSON.stringify({ success: false, error: `Unknown skill: ${name}` });
    }

    try {
      logToolCall(name, params);
      const result = await skill.handler(params);
      return result;
    } catch (error) {
      logger.error(`[SkillRegistry] Skill ${name} execution error:`, error);
      return JSON.stringify({ success: false, error: String(error) });
    }
  }

  /**
   * 将所有 Skill 转换为工具并注册到工具注册表
   */
  registerSkillsAsTools(): void {
    const toolRegistry = getToolRegistry();

    for (const skill of this.skills.values()) {
      toolRegistry.registerTool({
        name: skill.name,
        description: skill.description,
        parameters: skill.parameters,
        execute: async (params: Record<string, unknown>) => {
          try {
            const result = await skill.handler(params);
            return { success: true, result };
          } catch (error) {
            return { success: false, error: String(error) };
          }
        },
      });
    }

    logger.info(`[SkillRegistry] Registered ${this.skills.size} skills as tools`);
  }
}

// 全局单例
let skillRegistry: SkillRegistry | null = null;

/**
 * 获取 Skill 注册表实例
 */
export const getSkillRegistry = (): SkillRegistry => {
  if (!skillRegistry) {
    skillRegistry = new SkillRegistry();
  }
  return skillRegistry;
};

/**
 * 创建 Skill 定义
 */
export const createSkill = (
  name: string,
  description: string,
  parameters: Record<string, unknown>,
  handler: SkillHandler,
): SkillDefinition => ({
  name,
  description,
  parameters,
  handler,
});

export default SkillRegistry;
