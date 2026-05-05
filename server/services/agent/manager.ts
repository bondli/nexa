import type { AgentConfig, SkillDefinition } from './types';
import { createAgent } from './agent';
import type Agent from './agent';
import { logAgentExecution } from './logging';
import logger from 'electron-log';
import { getSkillRegistry } from './skills/registry';
import type { SkillInstance } from '../../models/skill';

/**
 * 从数据库加载用户安装的 Skills 到 registry
 */
const loadSkillsFromDB = async (): Promise<void> => {
  try {
    // 延迟导入避免循环依赖
    const Skill = require('../../models/skill').default;
    const registry = getSkillRegistry();

    const skills = await Skill.findAll({ where: { enabled: true } });

    for (const skillModel of skills) {
      try {
        const skillDef = parseSkillFromDBModel(skillModel);
        registry.installSkill(skillDef);
        logger.info(`[AgentManager] Loaded skill from DB: ${skillModel.name}`);
      } catch (error) {
        logger.warn(`[AgentManager] Failed to load skill ${skillModel.name}:`, error);
      }
    }

    logger.info(`[AgentManager] Loaded ${skills.length} skills from DB`);
  } catch (error) {
    logger.error('[AgentManager] Error loading skills from DB:', error);
  }
};

/**
 * 从数据库模型解析 Skill 定义
 */
const parseSkillFromDBModel = (skillModel: SkillInstance): SkillDefinition => {
  // 动态加载入口文件
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const skillsBaseDir = path.join(os.homedir(), '.nexa', 'skills');
  const skillDir = path.join(skillsBaseDir, skillModel.name);

  // 查找入口脚本：优先使用 index.js，否则使用第一个 .js 文件
  let entryFile = 'index.js';
  if (!fs.existsSync(path.join(skillDir, entryFile))) {
    const files = fs.readdirSync(skillDir).filter((f: string) => f.endsWith('.js'));
    if (files.length === 0) {
      throw new Error(`Skill ${skillModel.name} 目录中没有找到 .js 文件`);
    }
    entryFile = files[0];
  }

  const entryPath = path.join(skillDir, entryFile);

  const module = require(entryPath);
  const handler = module.default || module.handler || module.execute;

  if (typeof handler !== 'function') {
    throw new Error(`入口文件 ${entryPath} 未导出有效的 handler 函数`);
  }

  return {
    name: skillModel.name,
    description: skillModel.description,
    parameters: {},
    handler: async (params) => {
      try {
        const result = await handler(params);
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (error) {
        logger.error(`[AgentManager] Skill ${skillModel.name} 执行失败:`, error);
        return JSON.stringify({ success: false, error: String(error) });
      }
    },
  };
};

/**
 * Agent 信息
 */
interface AgentInfo {
  id: string;
  name: string;
  agent: ReturnType<typeof createAgent>;
  config: AgentConfig;
  createdAt: Date;
  lastUsedAt: Date;
}

/**
 * Agent 管理器
 * 管理多个 Agent 实例的生命周期
 */
class AgentManager {
  private agents: Map<string, AgentInfo> = new Map();
  private defaultAgentInfo: AgentInfo | null = null;

  /**
   * 创建 Agent
   */
  createAgent(name: string, config?: Partial<AgentConfig>): Agent {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const agentConfig: AgentConfig = {
      sessionId: config?.sessionId || '',
      useTools: config?.useTools ?? true,
      useRAG: config?.useRAG ?? false,
      knowledgeIds: config?.knowledgeIds || [],
      ...config,
    };

    const agent = createAgent(agentConfig);

    const agentInfo: AgentInfo = {
      id: agentId,
      name,
      agent,
      config: agentConfig,
      createdAt: new Date(),
      lastUsedAt: new Date(),
    };

    this.agents.set(agentId, agentInfo);
    logAgentExecution(agentId, 'Agent created', { name, config: agentConfig });

    return agent;
  }

  /**
   * 获取 Agent
   */
  getAgent(agentId: string): Agent | undefined {
    const info = this.agents.get(agentId);
    if (info) {
      info.lastUsedAt = new Date();
      return info.agent;
    }
    return undefined;
  }

  /**
   * 获取或创建默认 Agent
   */
  getDefaultAgent(): ReturnType<typeof createAgent> {
    if (!this.defaultAgentInfo) {
      this.defaultAgentInfo = {
        id: 'default',
        name: 'Default Agent',
        agent: createAgent(),
        config: { sessionId: '' },
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
    }
    this.defaultAgentInfo.lastUsedAt = new Date();
    return this.defaultAgentInfo.agent;
  }

  /**
   * 列出所有 Agent
   */
  listAgents(): Array<{ id: string; name: string; createdAt: Date; lastUsedAt: Date }> {
    return Array.from(this.agents.values()).map((info) => ({
      id: info.id,
      name: info.name,
      createdAt: info.createdAt,
      lastUsedAt: info.lastUsedAt,
    }));
  }

  /**
   * 删除 Agent
   */
  deleteAgent(agentId: string): boolean {
    const info = this.agents.get(agentId);
    if (info) {
      // 清理会话
      if (info.config.sessionId) {
        info.agent.cleanup(info.config.sessionId);
      }
      this.agents.delete(agentId);
      logAgentExecution(agentId, 'Agent deleted', {});
      return true;
    }
    return false;
  }

  /**
   * 路由：根据配置选择 Agent
   */
  route(sessionId: string, options?: Partial<AgentConfig>): Agent {
    // 简单路由策略：每次都创建新 Agent 或返回默认 Agent
    if (options?.useTools === false) {
      // 简单对话模式
      return createAgent({ sessionId, useTools: false });
    }

    return this.getDefaultAgent();
  }

  /**
   * 清理过期 Agent
   */
  cleanupExpired(maxIdleMinutes: number = 30): number {
    const now = new Date();
    let cleaned = 0;

    for (const [id, info] of this.agents.entries()) {
      const idleMinutes = (now.getTime() - info.lastUsedAt.getTime()) / (1000 * 60);
      if (idleMinutes > maxIdleMinutes) {
        this.deleteAgent(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`[AgentManager] Cleaned up ${cleaned} expired agents`);
    }

    return cleaned;
  }

  /**
   * 获取 Agent 数量
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * 清空所有 Agent
   */
  clear(): void {
    for (const [id] of this.agents.entries()) {
      this.deleteAgent(id);
    }
    this.defaultAgentInfo = null;
    logger.info('[AgentManager] Cleared all agents');
  }
}

// 全局单例
let agentManager: AgentManager | null = null;

/**
 * 获取 Agent 管理器实例
 */
export const getAgentManager = (): AgentManager => {
  if (!agentManager) {
    agentManager = new AgentManager();
  }
  return agentManager;
};

/**
 * 初始化 Agent 系统：从数据库加载 Skills
 */
export const initializeAgentSkills = async (): Promise<void> => {
  await loadSkillsFromDB();
};

export default AgentManager;
