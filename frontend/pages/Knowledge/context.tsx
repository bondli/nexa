import React, { createContext, useState, useEffect } from 'react';
import request from '@commons/request';
import { KnowBaseType, DocumentType } from './constant';

type KnowledgeContextType = {
  currentKnowledge: KnowBaseType | null;
  setCurrentKnowledge: React.Dispatch<React.SetStateAction<KnowBaseType | null>>;
  knowledgeList: KnowBaseType[];
  setKnowledgeList: React.Dispatch<React.SetStateAction<KnowBaseType[]>>;
  documentList: DocumentType[];
  setDocumentList: React.Dispatch<React.SetStateAction<DocumentType[]>>;
  selectedDocument: DocumentType | null;
  setSelectedDocument: React.Dispatch<React.SetStateAction<DocumentType | null>>;
  knowledgeLoading: boolean;
  getKnowledgeList: () => Promise<void>;
  getDocumentList: (knowledgeId: number) => Promise<void>;
  createKnowledge: (name: string, description: string) => Promise<any>;
  deleteKnowledge: (id: number) => Promise<any>;
};

export const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export const KnowledgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentKnowledge, setCurrentKnowledge] = useState<KnowBaseType | null>(null);
  const [knowledgeList, setKnowledgeList] = useState<KnowBaseType[]>([]);
  const [documentList, setDocumentList] = useState<DocumentType[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [knowledgeLoading, setKnowledgeLoading] = useState(true);

  // 获取知识库列表
  const getKnowledgeList = async () => {
    setKnowledgeLoading(true);
    try {
      const response = await request.get('/knowledge/list');
      const list = response.data || [];
      setKnowledgeList(list);

      // 如果没有当前选中的知识库，且列表不为空，则默认选中第一个
      if (!currentKnowledge && list.length > 0) {
        setCurrentKnowledge(list[0]);
        // 加载第一个知识库的文档
        getDocumentList(list[0].id as number);
      }
    } catch (error) {
      console.error('获取知识库列表失败:', error);
    } finally {
      setKnowledgeLoading(false);
    }
  };

  // 获取知识库文档列表
  const getDocumentList = async (knowledgeId: number) => {
    try {
      const response = await request.get(`/docs/getList?knowledgeId=${knowledgeId}`);
      setDocumentList(response.data || []);
    } catch (error) {
      console.error('获取文档列表失败:', error);
    }
  };

  // 创建知识库
  const createKnowledge = async (name: string, description: string) => {
    const response = await request.post('/knowledge/create', { name, description });
    return response;
  };

  // 删除知识库
  const deleteKnowledge = async (id: number) => {
    const response = await request.post(`/knowledge/delete?id=${id}`);
    return response;
  };

  // 首次加载获取知识库列表
  useEffect(() => {
    getKnowledgeList();
  }, []);

  // 当知识库切换时，重新加载文档列表
  useEffect(() => {
    if (currentKnowledge) {
      getDocumentList(currentKnowledge.id as number);
    }
  }, [currentKnowledge]);

  return (
    <KnowledgeContext.Provider
      value={{
        currentKnowledge,
        setCurrentKnowledge,
        knowledgeList,
        setKnowledgeList,
        documentList,
        setDocumentList,
        selectedDocument,
        setSelectedDocument,
        knowledgeLoading,
        getKnowledgeList,
        getDocumentList,
        createKnowledge,
        deleteKnowledge,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
};
