import type { AgentConfig } from './types';
import { createAgent } from './agent';
import type Agent from './agent';
import { logAgentExecution } from './logging';
import logger from 'electron-log';

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

export default AgentManager;
