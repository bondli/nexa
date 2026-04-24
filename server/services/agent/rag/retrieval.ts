import { semanticSearch } from '../../vector-store-service';
import { generateEmbedding } from '../../embedding-service';
import type { RetrievalResult, RAGConfig } from '../types';
import { logRetrieval } from '../logging';
import logger from 'electron-log';

/**
 * RAG 服务配置
 */
export interface RAGServiceConfig {
  defaultTopK: number;
  minScore: number;
  maxContextLength: number;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: RAGServiceConfig = {
  defaultTopK: 5,
  minScore: 0.7,
  maxContextLength: 4000,
};

/**
 * 检索服务
 * 封装向量检索逻辑
 */
class RetrievalService {
  private config: RAGServiceConfig;

  constructor(config?: Partial<RAGServiceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 执行检索
   */
  async retrieve(query: string, config: RAGConfig): Promise<RetrievalResult[]> {
    const { knowledgeIds, topK, minScore } = config;
    const effectiveTopK = topK || this.config.defaultTopK;
    const effectiveMinScore = minScore || this.config.minScore;

    if (!knowledgeIds || knowledgeIds.length === 0) {
      logger.warn('[RetrievalService] No knowledge IDs provided');
      return [];
    }

    try {
      // 生成查询向量
      const queryEmbedding = await generateEmbedding(query);

      // 对多个知识库分别检索并合并结果
      const allResults: RetrievalResult[] = [];

      for (const knowledgeId of knowledgeIds) {
        const results = await semanticSearch(knowledgeId, queryEmbedding, effectiveTopK);

        const mappedResults: RetrievalResult[] = results
          .filter((r) => r.score >= effectiveMinScore)
          .map((r) => ({
            id: r.id,
            content: r.payload.content || '',
            score: r.score,
            metadata: r.payload,
          }));

        allResults.push(...mappedResults);
      }

      // 按得分排序
      allResults.sort((a, b) => b.score - a.score);

      // 取 top K
      const finalResults = allResults.slice(0, effectiveTopK);

      logRetrieval('rag', query, finalResults.length, knowledgeIds);

      return finalResults;
    } catch (error) {
      logger.error('[RetrievalService] Retrieval error:', error);
      return [];
    }
  }

  /**
   * 格式化检索结果为上下文
   */
  formatContext(results: RetrievalResult[]): string {
    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map((r, i) => {
      const title = r.metadata.title || r.metadata.name || `文档 ${i + 1}`;
      return `【文档 ${i + 1}】${title}\n${r.content}`;
    });

    return `以下是相关参考文档：\n\n${contextParts.join('\n\n')}`;
  }

  /**
   * 截断上下文长度
   */
  truncateContext(context: string, maxLength?: number): string {
    const effectiveMaxLength = maxLength || this.config.maxContextLength;

    if (context.length <= effectiveMaxLength) {
      return context;
    }

    return context.slice(0, effectiveMaxLength) + '...(内容已截断)';
  }

  /**
   * 准备 RAG 上下文
   */
  async prepareRAGContext(
    query: string,
    config: RAGConfig,
  ): Promise<{ context: string; hasResults: boolean }> {
    const results = await this.retrieve(query, config);

    if (results.length === 0) {
      return { context: '', hasResults: false };
    }

    let context = this.formatContext(results);
    context = this.truncateContext(context);

    return { context, hasResults: true };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RAGServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): RAGServiceConfig {
    return { ...this.config };
  }
}

// 全局单例
let retrievalService: RetrievalService | null = null;

/**
 * 获取检索服务实例
 */
export const getRetrievalService = (config?: Partial<RAGServiceConfig>): RetrievalService => {
  if (!retrievalService) {
    retrievalService = new RetrievalService(config);
  }
  return retrievalService;
};

export default RetrievalService;
