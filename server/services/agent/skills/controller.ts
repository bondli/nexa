import type { Request, Response } from 'express';
import { getSkillRegistry, createSkill } from './registry';
import { skillParametersToJsonSchema, type InstallSkillRequest } from './types';
import { success, notFound, badRequest, serverError } from '../../../utils/response';
import logger from 'electron-log';

/**
 * 获取已安装的 Skill 列表
 */
export const listSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const registry = getSkillRegistry();
    const skills = registry.getAllSkills();

    const skillList = skills.map((skill) => ({
      name: skill.name,
      description: skill.description,
      parameters: skill.parameters,
    }));

    success(res, skillList);
  } catch (error) {
    logger.error('[SkillController] Error listing skills:', error);
    serverError(res, 'Error listing skills');
  }
};

/**
 * 安装 Skill
 */
export const installSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, parameters, handlerCode } = req.body as InstallSkillRequest;

    if (!name || !description || !parameters || !handlerCode) {
      badRequest(res, 'Missing required fields: name, description, parameters, handlerCode');
      return;
    }

    // 将 handlerCode 作为函数体执行
    let handler: Function;
    try {
      // eslint-disable-next-line no-new-func
      handler = new Function('params', `
        const result = (async () => {
          ${handlerCode}
        })();
        return result;
      `);
    } catch (error) {
      badRequest(res, 'Invalid handler code');
      return;
    }

    const registry = getSkillRegistry();
    const skill = createSkill(name, description, skillParametersToJsonSchema(parameters), async (params) => {
      try {
        const fn = handler(params);
        if (typeof fn?.then === 'function') {
          return await fn;
        }
        return fn;
      } catch (error) {
        return JSON.stringify({ success: false, error: String(error) });
      }
    });

    registry.installSkill(skill);

    success(res, { name, message: 'Skill installed successfully' });
  } catch (error) {
    logger.error('[SkillController] Error installing skill:', error);
    serverError(res, 'Error installing skill');
  }
};

/**
 * 卸载 Skill
 */
export const uninstallSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      badRequest(res, 'Skill name is required');
      return;
    }

    const registry = getSkillRegistry();
    const existed = registry.uninstallSkill(name);

    if (existed) {
      success(res, { name, message: 'Skill uninstalled successfully' });
    } else {
      notFound(res, 'Skill not found');
    }
  } catch (error) {
    logger.error('[SkillController] Error uninstalling skill:', error);
    serverError(res, 'Error uninstalling skill');
  }
};

/**
 * 获取 Skill 详情
 */
export const getSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      badRequest(res, 'Skill name is required');
      return;
    }

    const registry = getSkillRegistry();
    const skill = registry.getSkill(name);

    if (skill) {
      success(res, {
        name: skill.name,
        description: skill.description,
        parameters: skill.parameters,
      });
    } else {
      notFound(res, 'Skill not found');
    }
  } catch (error) {
    logger.error('[SkillController] Error getting skill:', error);
    serverError(res, 'Error getting skill');
  }
};

/**
 * 执行 Skill（调试用）
 */
export const executeSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    const { params } = req.body;

    if (!name) {
      badRequest(res, 'Skill name is required');
      return;
    }

    const registry = getSkillRegistry();
    const result = await registry.executeSkill(name, params || {});

    success(res, { result });
  } catch (error) {
    logger.error('[SkillController] Error executing skill:', error);
    serverError(res, 'Error executing skill');
  }
};
