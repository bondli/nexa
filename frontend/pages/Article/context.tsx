import React, { createContext, useState, useCallback } from 'react';
import request from '@commons/request';
import { DEFAULT_CATE, VIRTUAL_CATES, ArticleCate, Article, TempArticle } from './constant';

type ArticleContextType = {
  currentCate: ArticleCate;
  setCurrentCate: React.Dispatch<React.SetStateAction<ArticleCate>>;
  cateList: ArticleCate[];
  setCateList: React.Dispatch<React.SetStateAction<ArticleCate[]>>;
  articleList: Article[] | TempArticle[];
  setArticleList: React.Dispatch<React.SetStateAction<Article[] | TempArticle[]>>;
  selectedArticle: Article | null;
  setSelectedArticle: React.Dispatch<React.SetStateAction<Article | null>>;
  articleCounts: { [key: string]: number };
  getArticleList: (isLoadMore?: boolean) => Promise<void>;
  getArticleDetail: (id: number) => Promise<Article | null>;
  createArticle: (data: { title: string; desc?: string; url: string; cateId: number }) => Promise<Article | null>;
  updateArticle: (data: {
    id: number;
    title?: string;
    desc?: string;
    url?: string;
    cateId?: number;
    status?: string;
    opType?: string;
  }) => Promise<Article | null>;
  deleteArticle: (id: number) => Promise<boolean>;
  recoverArticle: (id: number, cateId: number) => Promise<boolean>;
  removeArticle: (id: number) => Promise<boolean>;
  getArticleCateList: () => void;
  createArticleCate: (data: { icon?: string; name: string; orders?: number }) => Promise<ArticleCate | null>;
  updateArticleCate: (data: {
    id: number;
    icon?: string;
    name?: string;
    orders?: number;
  }) => Promise<ArticleCate | null>;
  deleteArticleCate: (id: number) => Promise<boolean>;
  getTempArticleList: (isLoadMore?: boolean) => Promise<void>;
  deleteTempArticle: (id: number) => Promise<boolean>;
  searchArticles: (searchKey: string) => void;
  getArticleCounts: () => void;
  searchKey: string;
  setSearchKey: React.Dispatch<React.SetStateAction<string>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  articleLoading: boolean;
  isTempCategory: boolean;
  isTrashCategory: boolean;
  articleHasMore: boolean;
  tempArticlePage: number;
};

export const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export const ArticleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCate, setCurrentCate] = useState<ArticleCate>(DEFAULT_CATE);
  const [cateList, setCateList] = useState<ArticleCate[]>([]);
  const [articleList, setArticleList] = useState<Article[] | TempArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleCounts, setArticleCounts] = useState<{ [key: string]: number }>({});
  const [searchKey, setSearchKey] = useState('');
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articleHasMore, setArticleHasMore] = useState(true);
  const [tempArticlePage, setTempArticlePage] = useState(1);

  // 判断是否是临时文章分类
  const isTempCategory = currentCate.id === 'temp';
  // 判断是否是回收站分类
  const isTrashCategory = currentCate.id === 'trash';

  // 获取文章列表（支持分页加载更多）
  const getArticleList = useCallback(
    async (isLoadMore = false) => {
      const targetPage = isLoadMore ? currentPage + 1 : 1;

      if (!isLoadMore) {
        setArticleLoading(true);
      } else if (articleLoading) {
        return;
      }

      try {
        const response = await request.get('/article/getList', {
          params: {
            cateId: currentCate.id,
            page: targetPage,
            pageSize,
          },
        });
        // response 本身就是 { code, data, count }
        const newList = response.data || [];
        const responseTotal = response.count || 0;

        if (isLoadMore) {
          setArticleList((prev) => [...prev, ...newList]);
        } else {
          setArticleList(newList);
        }

        setTotal(responseTotal);
        setCurrentPage(targetPage);
        setArticleHasMore(targetPage * pageSize < responseTotal);
      } catch (error) {
        console.error('获取文章列表失败:', error);
      } finally {
        setArticleLoading(false);
      }
    },
    [currentCate.id, currentPage, pageSize, articleLoading],
  );

  // 获取文章详情
  const getArticleDetail = async (id: number): Promise<Article | null> => {
    try {
      const response = await request.get('/article/detail', {
        params: { id },
      });
      return response.data || null;
    } catch (error) {
      console.error('获取文章详情失败:', error);
      return null;
    }
  };

  // 创建文章
  const createArticle = async (data: {
    title: string;
    desc?: string;
    url: string;
    cateId: number;
  }): Promise<Article | null> => {
    try {
      const response = await request.post('/article/add', data);
      await getArticleList();
      await getArticleCounts();
      return response.data || null;
    } catch (error) {
      console.error('创建文章失败:', error);
      return null;
    }
  };

  // 更新文章
  const updateArticle = async (data: {
    id: number;
    title?: string;
    desc?: string;
    url?: string;
    cateId?: number;
    status?: string;
    opType?: string;
  }): Promise<Article | null> => {
    try {
      const response = await request.post('/article/update', data);
      await getArticleList(false);
      await getArticleCounts();
      return response.data || null;
    } catch (error) {
      console.error('更新文章失败:', error);
      return null;
    }
  };

  // 删除文章到回收站
  const deleteArticle = async (id: number): Promise<boolean> => {
    try {
      await request.get('/article/delete', {
        params: { id },
      });
      await getArticleList(false);
      await getArticleCounts();
      return true;
    } catch (error) {
      console.error('删除文章失败:', error);
      return false;
    }
  };

  // 从回收站恢复文章
  const recoverArticle = async (id: number, cateId: number): Promise<boolean> => {
    try {
      await request.get('/article/recover', {
        params: { id, cateId },
      });
      await getArticleList(false);
      await getArticleCounts();
      return true;
    } catch (error) {
      console.error('恢复文章失败:', error);
      return false;
    }
  };

  // 彻底删除文章
  const removeArticle = async (id: number): Promise<boolean> => {
    try {
      await request.get('/article/remove', {
        params: { id },
      });
      await getArticleList(false);
      await getArticleCounts();
      return true;
    } catch (error) {
      console.error('删除文章失败:', error);
      return false;
    }
  };

  // 获取文章分类列表
  const getArticleCateList = async () => {
    try {
      const response = await request.get('/article_cate/list');
      // 将虚拟分类和用户分类合并
      const userCates = response.data || [];
      setCateList([...VIRTUAL_CATES, ...userCates]);
    } catch (error) {
      console.error('获取文章分类列表失败:', error);
      setCateList([...VIRTUAL_CATES]);
    }
  };

  // 创建文章分类
  const createArticleCate = async (data: {
    icon?: string;
    name: string;
    orders?: number;
  }): Promise<ArticleCate | null> => {
    try {
      const response = await request.post('/article_cate/create', data);
      await getArticleCateList();
      return response.data || null;
    } catch (error) {
      console.error('创建文章分类失败:', error);
      return null;
    }
  };

  // 更新文章分类
  const updateArticleCate = async (data: {
    id: number;
    icon?: string;
    name?: string;
    orders?: number;
  }): Promise<ArticleCate | null> => {
    try {
      const response = await request.post('/article_cate/update', data);
      await getArticleCateList();
      return response.data || null;
    } catch (error) {
      console.error('更新文章分类失败:', error);
      return null;
    }
  };

  // 删除文章分类
  const deleteArticleCate = async (id: number): Promise<boolean> => {
    try {
      await request.get('/article_cate/delete', {
        params: { id },
      });
      await getArticleCateList();
      await getArticleList();
      return true;
    } catch (error) {
      console.error('删除文章分类失败:', error);
      return false;
    }
  };

  // 获取临时文章列表（支持分页加载更多）
  const getTempArticleList = useCallback(
    async (isLoadMore = false) => {
      const targetPage = isLoadMore ? tempArticlePage + 1 : 1;

      if (!isLoadMore) {
        setArticleLoading(true);
      } else if (articleLoading) {
        return;
      }

      try {
        const response = await request.get('/temp_article/list', {
          params: {
            page: targetPage,
            pageSize,
          },
        });
        const newList = response.data || [];
        const responseTotal = response.count || 0;

        if (isLoadMore) {
          setArticleList((prev) => [...prev, ...newList]);
        } else {
          setArticleList(newList);
        }

        setTotal(responseTotal);
        setTempArticlePage(targetPage);
        setArticleHasMore(targetPage * pageSize < responseTotal);
      } catch (error) {
        console.error('获取临时文章列表失败:', error);
      } finally {
        setArticleLoading(false);
      }
    },
    [tempArticlePage, pageSize, articleLoading],
  );

  // 删除临时文章
  const deleteTempArticle = async (id: number): Promise<boolean> => {
    try {
      await request.get('/temp_article/delete', {
        params: { id },
      });
      await getTempArticleList();
      await getArticleCounts();
      return true;
    } catch (error) {
      console.error('删除临时文章失败:', error);
      return false;
    }
  };

  // 搜索文章
  const searchArticles = async (key: string) => {
    setArticleLoading(true);
    try {
      const response = await request.post('/article/searchList', {
        cateId: currentCate.id,
        searchKey: key,
      });
      setArticleList(response.data || []);
      setTotal(response.count || 0);
    } catch (error) {
      console.error('搜索文章失败:', error);
    } finally {
      setArticleLoading(false);
    }
  };

  // 获取文章数量统计
  const getArticleCounts = async () => {
    try {
      const response = await request.get('/article/counts');
      setArticleCounts(response.data || {});
    } catch (error) {
      console.error('获取文章数量统计失败:', error);
    }
  };

  return (
    <ArticleContext.Provider
      value={{
        currentCate,
        setCurrentCate,
        cateList,
        setCateList,
        articleList,
        setArticleList,
        getArticleList,
        getArticleDetail,
        createArticle,
        updateArticle,
        deleteArticle,
        recoverArticle,
        removeArticle,
        selectedArticle,
        setSelectedArticle,
        articleCounts,
        getArticleCateList,
        createArticleCate,
        updateArticleCate,
        deleteArticleCate,
        getTempArticleList,
        deleteTempArticle,
        searchArticles,
        getArticleCounts,
        searchKey,
        setSearchKey,
        total,
        setTotal,
        currentPage,
        setCurrentPage,
        pageSize,
        articleLoading,
        isTempCategory,
        isTrashCategory,
        articleHasMore,
        tempArticlePage,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
};
