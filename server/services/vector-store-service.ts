import { getVectorDBClient, getCollectionName } from '../config/vectorDB';

/**
 * 向量存储服务
 * 提供向量数据库的增删查操作
 */

/**
 * 添加文档嵌入
 */
export const addDocumentEmbedding = async (
  noteId: number,
  embedding: number[],
  metadata: Record<string, any>,
): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    await collection.add({
      ids: [`note_${noteId}`],
      embeddings: [embedding],
      metadatas: [{ ...metadata, noteId }],
    });
  } catch (error) {
    console.error('添加文档嵌入失败:', error);
    throw error;
  }
};

/**
 * 更新文档嵌入
 */
export const updateDocumentEmbedding = async (
  noteId: number,
  embedding: number[],
  metadata: Record<string, any>,
): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    // 删除旧嵌入
    await collection.delete({
      ids: [`note_${noteId}`],
    });

    // 添加新嵌入
    await collection.add({
      ids: [`note_${noteId}`],
      embeddings: [embedding],
      metadatas: [{ ...metadata, noteId }],
    });
  } catch (error) {
    console.error('更新文档嵌入失败:', error);
    throw error;
  }
};

/**
 * 删除文档嵌入
 */
export const deleteDocumentEmbedding = async (noteId: number): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    await collection.delete({
      ids: [`note_${noteId}`],
    });
  } catch (error) {
    console.error('删除文档嵌入失败:', error);
    throw error;
  }
};

/**
 * 语义搜索
 */
export const semanticSearch = async (
  queryEmbedding: number[],
  topK = 5,
): Promise<
  Array<{
    id: string;
    score: number;
    metadata: Record<string, any>;
  }>
> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
    });

    if (!results || !results.ids || results.ids.length === 0) {
      return [];
    }

    // 格式化搜索结果
    return results.ids[0].map((id, index) => ({
      id,
      score: 1 - (results.distances?.[0]?.[index] || 0),
      metadata: results.metadatas?.[0]?.[index] || {},
    }));
  } catch (error) {
    console.error('语义搜索失败:', error);
    throw error;
  }
};

/**
 * 获取集合中的文档数量
 */
export const getCollectionCount = async (): Promise<number> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    return await collection.count();
  } catch (error) {
    console.error('获取文档数量失败:', error);
    throw error;
  }
};

/**
 * 清空集合
 */
export const clearCollection = async (): Promise<void> => {
  try {
    const client = getVectorDBClient();
    const collection = await client.getOrCreateCollection({
      name: getCollectionName(),
    });

    const count = await collection.count();
    if (count > 0) {
      // 获取所有 ID 并删除
      const allIds = Array.from({ length: count }, (_, i) => `temp_${i}`);
      await collection.delete({ ids: allIds });
    }
  } catch (error) {
    console.error('清空集合失败:', error);
    throw error;
  }
};
