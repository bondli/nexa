import { getVectorDBClient } from '../config/vectorDB';
import logger from 'electron-log';

// 向量维度（与 embedding 模型一致，需与 embedding 服务的向量维度匹配）
// doubao-embedding-vision 是 2048 维
const VECTOR_SIZE = 2048;

/**
 * 获取知识库对应的 collection 名称
 */
export const getCollectionName = (knowledgeId: number): string => {
  return `knowledge_${knowledgeId}`;
};

/**
 * 创建知识库的 collection
 */
export const createCollection = async (knowledgeId: number): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    // 直接尝试获取 collection 信息，如果不存在会抛错
    try {
      await client.getCollection(collectionName);
      logger.info(`Collection ${collectionName} 已存在，跳过创建`);
      return;
    } catch (e: any) {
      // 404 说明不存在，继续创建
      if (e.status === 404 || (e.status === 400 && e.data?.status?.error?.includes('not found'))) {
        // 继续创建
      } else {
        // 其他错误，尝试创建
      }
    }

    // 创建 collection
    logger.info(`创建 Collection: ${collectionName}, 向量维度: ${VECTOR_SIZE}`);
    await client.createCollection(collectionName, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
    });

    logger.info(`创建 Collection 成功: ${collectionName}, 向量维度: ${VECTOR_SIZE}`);
  } catch (error) {
    logger.error('创建 Collection 失败:', error);
    throw error;
  }
};

/**
 * 删除知识库的 collection
 */
export const deleteCollection = async (knowledgeId: number): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    await client.deleteCollection(collectionName);
    logger.info(`删除 Collection 成功: ${collectionName}`);
  } catch (error) {
    logger.error('删除 Collection 失败:', error);
    throw error;
  }
};

/**
 * 添加文档嵌入
 */
export const addDocumentEmbedding = async (
  documentId: number,
  knowledgeId: number,
  embedding: number[],
  metadata: Record<string, any>,
): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    logger.info(`准备添加文档嵌入: collection=${collectionName}, docId=doc_${documentId}, vectorDim=${embedding.length}`);

    await client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: documentId,
          vector: embedding,
          payload: {
            ...metadata,
            documentId,
            knowledgeId,
          },
        },
      ],
    });

    logger.info(`添加文档嵌入成功: doc_${documentId}`);
  } catch (error: any) {
    const errorDetail = error.response?.data || error;
    logger.error('添加文档嵌入失败:', JSON.stringify(errorDetail, null, 2));
    throw error;
  }
};

/**
 * 更新文档嵌入
 */
export const updateDocumentEmbedding = async (
  documentId: number,
  knowledgeId: number,
  embedding: number[],
  metadata: Record<string, any>,
): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    // 先删除旧的
    await client.delete(collectionName, {
      wait: true,
      points: [documentId],
    });

    // 再添加新的
    await client.upsert(collectionName, {
      wait: true,
      points: [
        {
          id: documentId,
          vector: embedding,
          payload: {
            ...metadata,
            documentId,
            knowledgeId,
          },
        },
      ],
    });

    logger.info(`更新文档嵌入成功: doc_${documentId}`);
  } catch (error) {
    logger.error('更新文档嵌入失败:', error);
    throw error;
  }
};

/**
 * 删除文档嵌入
 */
export const deleteDocumentEmbedding = async (
  documentId: number,
  knowledgeId: number,
): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    await client.delete(collectionName, {
      wait: true,
      points: [documentId],
    });

    logger.info(`删除文档嵌入成功: doc_${documentId}`);
  } catch (error) {
    logger.error('删除文档嵌入失败:', error);
    throw error;
  }
};

/**
 * 语义搜索
 */
export const semanticSearch = async (
  knowledgeId: number,
  queryEmbedding: number[],
  topK = 5,
): Promise<
  Array<{
    id: string;
    score: number;
    payload: Record<string, any>;
  }>
> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    const results = await client.search(collectionName, {
      vector: queryEmbedding,
      limit: topK,
      with_payload: true,
    });

    return results.map((point: any) => ({
      id: point.id,
      score: point.score,
      payload: point.payload || {},
    }));
  } catch (error) {
    logger.error('语义搜索失败:', error);
    throw error;
  }
};

/**
 * 获取 collection 中的文档数量
 * @param knowledgeId 知识库 ID（可选，不传则返回 0）
 */
export const getCollectionCount = async (knowledgeId?: number): Promise<number> => {
  if (knowledgeId === undefined) {
    return 0;
  }
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    const info = await client.getCollection(collectionName);
    return info.points_count || 0;
  } catch (error) {
    logger.error('获取文档数量失败:', error);
    throw error;
  }
};

/**
 * 清空 collection
 * @param knowledgeId 知识库 ID（必填）
 */
export const clearCollection = async (knowledgeId: number): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collectionName = getCollectionName(knowledgeId);

    // 获取所有 points 并删除
    const info = await client.getCollection(collectionName);
    if (info.points_count && info.points_count > 0) {
      const scrollResult = await client.scroll(collectionName, { limit: 100 });
      const ids = (scrollResult as any).result?.map((point: any) => point.id) || [];

      if (ids.length > 0) {
        await client.delete(collectionName, {
          wait: true,
          points: ids,
        });
      }
    }

    logger.info(`清空 Collection 成功: ${collectionName}`);
  } catch (error) {
    logger.error('清空 Collection 失败:', error);
    throw error;
  }
};
