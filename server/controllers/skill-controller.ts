import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import archiver from 'archiver';
import logger from 'electron-log';
import { success, badRequest, notFound, serverError } from '../utils/response';
import Skill from '../models/skill';
import type { SkillInstance } from '../models/skill';
import { getSkillRegistry } from '../services/agent/skills/registry';
import type { SkillDefinition } from '../services/agent/types';

/**
 * 获取 Skills 基础目录
 */
const getSkillsBaseDir = (): string => {
  const baseDir = path.join(os.homedir(), '.nexa', 'skills');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
};

/**
 * 解析 skill.md 文件，提取元数据
 */
const parseSkillMd = (skillDir: string): { name: string; description: string; version: string; author: string } | null => {
  const skillMdPath = path.join(skillDir, 'skill.md');

  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const lines = content.split('\n');

    let name = '';
    let description = '';
    let version = '1.0.0';
    let author = '';

    // 简单解析 skill.md 格式
    // # Skill Name (第一行通常是 name)
    // name: xxx
    // description: xxx
    // version: xxx
    // author: xxx

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        // 标题行，可能是 name
        name = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('name:')) {
        name = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('description:')) {
        description = trimmed.substring(12).trim();
      } else if (trimmed.startsWith('version:')) {
        version = trimmed.substring(8).trim();
      } else if (trimmed.startsWith('author:')) {
        author = trimmed.substring(7).trim();
      }
    }

    return { name, description, version, author };
  } catch (error) {
    logger.error('[SkillController] 解析 skill.md 失败:', error);
    return null;
  }
};

/**
 * 从数据库记录解析 Skill 定义并注册到 registry
 */
const registerSkillFromDB = async (skillModel: SkillInstance): Promise<void> => {
  const skillsBaseDir = getSkillsBaseDir();
  const skillDir = path.join(skillsBaseDir, skillModel.name);

  // 查找入口脚本（index.js 或第一个 .js 文件）
  const files = fs.readdirSync(skillDir).filter((f) => f.endsWith('.js'));
  if (files.length === 0) {
    throw new Error(`Skill ${skillModel.name} 目录中没有找到 .js 文件`);
  }

  const entryFile = files.includes('index.js') ? 'index.js' : files[0];
  const entryPath = path.join(skillDir, entryFile);

  const module = require(entryPath);
  const handler = module.default || module.handler || module.execute;

  if (typeof handler !== 'function') {
    throw new Error(`入口文件 ${entryPath} 未导出有效的 handler 函数`);
  }

  const skillDef: SkillDefinition = {
    name: skillModel.name,
    description: skillModel.description,
    parameters: {},
    handler: async (params) => {
      try {
        const result = await handler(params);
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (error) {
        logger.error(`[SkillController] Skill ${skillModel.name} 执行失败:`, error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  };

  const registry = getSkillRegistry();
  registry.installSkill(skillDef);
};

/**
 * 解析 Skill 目录，返回元数据
 */
export const parseSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { skillDir, skillMdContent, files } = req.body;

    // 优先使用 skillMdContent（前端直接传递 skill.md 内容）
    if (skillMdContent) {
      try {
        const lines = skillMdContent.split('\n');
        let name = '';
        let description = '';
        let version = '1.0.0';
        let author = '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('# ')) {
            name = trimmed.substring(2).trim();
          } else if (trimmed.startsWith('name:')) {
            name = trimmed.substring(5).trim();
          } else if (trimmed.startsWith('description:')) {
            description = trimmed.substring(12).trim();
          } else if (trimmed.startsWith('version:')) {
            version = trimmed.substring(8).trim();
          } else if (trimmed.startsWith('author:')) {
            author = trimmed.substring(7).trim();
          }
        }

        if (!name) {
          badRequest(res, '无法从 skill.md 解析出 name');
          return;
        }

        success(res, { name, description, version, author });
        return;
      } catch (error) {
        badRequest(res, '解析 skill.md 失败');
        return;
      }
    }

    // 否则尝试从 skillDir 读取
    if (skillDir) {
      const meta = parseSkillMd(skillDir);
      if (meta) {
        success(res, meta);
        return;
      }
      notFound(res, '未找到 skill.md 文件');
      return;
    }

    badRequest(res, '需要提供 skillDir 或 skillMdContent');
  } catch (error) {
    logger.error('[SkillController] Error parsing skill:', error);
    serverError(res, '解析 Skill 失败');
  }
};

/**
 * 获取已安装的 Skills 列表
 */
export const listSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.findAll({
      order: [['createdAt', 'DESC']],
    });

    const skillList = skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      version: skill.version,
      author: skill.author,
      category: skill.category,
      tags: skill.tags ? JSON.parse(skill.tags) : [],
      enabled: skill.enabled,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }));

    success(res, skillList);
  } catch (error) {
    logger.error('[SkillController] Error listing skills:', error);
    serverError(res, 'Error listing skills');
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

    const skill = await Skill.findOne({ where: { name } });

    if (!skill) {
      notFound(res, 'Skill not found');
      return;
    }

    success(res, skill.toJSON());
  } catch (error) {
    logger.error('[SkillController] Error getting skill:', error);
    serverError(res, 'Error getting skill');
  }
};

/**
 * 安装新 Skill
 */
export const installSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, version, author, category, tags, files } = req.body;

    if (!name || !description) {
      badRequest(res, 'name and description are required');
      return;
    }

    // 检查是否已存在
    const existing = await Skill.findOne({ where: { name } });
    if (existing) {
      badRequest(res, `Skill "${name}" already exists`);
      return;
    }

    // 创建 Skill 记录
    const skill = await Skill.create({
      name,
      description,
      version: version || '1.0.0',
      author: author || '',
      category: category || null,
      tags: tags ? JSON.stringify(tags) : null,
      enabled: true,
    });

    // 创建技能目录并写入文件
    const skillsBaseDir = getSkillsBaseDir();
    const skillDir = path.join(skillsBaseDir, name);

    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // 写入文件
    if (files && typeof files === 'object') {
      for (const [filename, content] of Object.entries(files)) {
        const filePath = path.join(skillDir, filename);
        // 确保子目录存在
        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        fs.writeFileSync(filePath, content as string, 'utf-8');
      }
    }

    // 注册到 registry
    try {
      await registerSkillFromDB(skill);
    } catch (e) {
      logger.warn(`[SkillController] Skill ${name} 注册到 registry 失败:`, e);
    }

    success(res, { id: skill.id, name: skill.name }, 'Skill installed successfully');
  } catch (error) {
    logger.error('[SkillController] Error installing skill:', error);
    serverError(res, 'Error installing skill');
  }
};

/**
 * 切换 Skill 启用/禁用状态
 */
export const toggleSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;
    const { enabled } = req.body;

    if (!name) {
      badRequest(res, 'Skill name is required');
      return;
    }

    const skill = await Skill.findOne({ where: { name } });

    if (!skill) {
      notFound(res, 'Skill not found');
      return;
    }

    await skill.update({ enabled });

    // 同步更新 registry
    const registry = getSkillRegistry();
    if (enabled) {
      try {
        await registerSkillFromDB(skill);
      } catch (e) {
        logger.warn(`[SkillController] Skill ${name} 启用失败:`, e);
        serverError(res, 'Skill 启用失败');
        return;
      }
    } else {
      registry.uninstallSkill(name);
    }

    success(res, { name, enabled }, enabled ? 'Skill enabled' : 'Skill disabled');
  } catch (error) {
    logger.error('[SkillController] Error toggling skill:', error);
    serverError(res, 'Error toggling skill');
  }
};

/**
 * 删除 Skill
 */
export const deleteSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.params;

    if (!name) {
      badRequest(res, 'Skill name is required');
      return;
    }

    const skill = await Skill.findOne({ where: { name } });

    if (!skill) {
      notFound(res, 'Skill not found');
      return;
    }

    // 从数据库删除
    await skill.destroy();

    // 从 registry 移除
    const registry = getSkillRegistry();
    registry.uninstallSkill(name);

    // 删除技能目录
    const skillsBaseDir = getSkillsBaseDir();
    const skillDir = path.join(skillsBaseDir, name);
    if (fs.existsSync(skillDir)) {
      fs.rmSync(skillDir, { recursive: true, force: true });
    }

    success(res, null, 'Skill deleted successfully');
  } catch (error) {
    logger.error('[SkillController] Error deleting skill:', error);
    serverError(res, 'Error deleting skill');
  }
};

/**
 * 导出所有 Skills 为 zip
 */
export const exportAllSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await Skill.findAll();

    if (skills.length === 0) {
      success(res, { message: '没有可导出的 Skills' });
      return;
    }

    const skillsBaseDir = getSkillsBaseDir();

    // 创建 zip 归档
    const archive = archiver('zip', { zlib: { level: 9 } });

    // 设置响应头
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="nexa-skills-${Date.now()}.zip"`);

    archive.pipe(res);

    // 添加每个 skill 目录到归档
    for (const skill of skills) {
      const skillDir = path.join(skillsBaseDir, skill.name);
      if (fs.existsSync(skillDir)) {
        archive.directory(skillDir, skill.name);
      }
    }

    // 添加 metadata.json 记录 skill 元数据（不含 handlerCode）
    const metadata = skills.map((s) => ({
      name: s.name,
      description: s.description,
      version: s.version,
      author: s.author,
      category: s.category,
      tags: s.tags ? JSON.parse(s.tags) : [],
      enabled: s.enabled,
    }));
    archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

    archive.finalize();
  } catch (error) {
    logger.error('[SkillController] Error exporting skills:', error);
    serverError(res, '导出 Skills 失败');
  }
};

/**
 * 导入 Skills（从 zip）
 */
export const importSkills = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zipBase64 } = req.body;

    if (!zipBase64) {
      badRequest(res, '需要提供 zipBase64');
      return;
    }

    // 解码 zip
    const buffer = Buffer.from(zipBase64, 'base64');
    const tmpDir = path.join(os.tmpdir(), `nexa-skill-import-${Date.now()}`);

    // 解压到临时目录（这里需要使用 adm-zip 或类似库，实际简化处理）
    // TODO: 实现真正的 zip 解压

    // 暂时返回错误，提示需要服务端实现
    serverError(res, '导入功能暂未实现，请使用导出功能手动恢复');
  } catch (error) {
    logger.error('[SkillController] Error importing skills:', error);
    serverError(res, '导入 Skills 失败');
  }
};

/**
 * 执行 Skill（供 Agent 调用）
 */
export const executeSkill = async (name: string, params: Record<string, unknown>): Promise<string> => {
  const registry = getSkillRegistry();
  return registry.executeSkill(name, params);
};
