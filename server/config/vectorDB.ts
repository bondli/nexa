import { ChromaClient } from 'chromadb';

let chromaClient: ChromaClient | null = null;

const COLLECTION_NAME = 'nexa_embeddings';

/**
 * 初始化 Chroma 向量数据库连接
 */
export const initVectorDB = async (): Promise<void> => {
  try {
    chromaClient = await new ChromaClient({
      path: './vector_db', // 本地向量数据库存储路径
    });
    console.log('向量数据库连接成功');
  } catch (error) {
    console.error('向量数据库连接失败:', error);
    throw error;
  }
};

/**
 * 获取向量数据库客户端
 */
export const getVectorDBClient = (): ChromaClient => {
  if (!chromaClient) {
    throw new Error('向量数据库未初始化');
  }
  return chromaClient;
};

/**
 * 获取集合名称
 */
export const getCollectionName = (): string => {
  return COLLECTION_NAME;
};

/**
 * 关闭向量数据库连接
 */
export const closeVectorDB = async (): Promise<void> => {
  if (chromaClient) {
    // Chroma 的本地客户端会自动管理连接
    chromaClient = null;
    console.log('向量数据库连接已关闭');
  }
};

export default chromaClient;
