import React, { memo, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { List, Empty, Image, Drawer, Spin, App as AntdApp } from 'antd';
import { GithubFilled, LinkOutlined } from '@ant-design/icons';
import { format as timeAgoFormat } from 'timeago.js';
import { openExternalUrl } from '@commons/electron';
import request from '@commons/request';
import { ArticleContext } from './context';
import Actions from './Actions';
import style from './index.module.less';
import GenerateImage from '@/components/GenerateImage';
import MarkdownPreview from '@/components/MarkdownPreview';

const Articles: React.FC = () => {
  // 生成图片成功后刷新列表
  const { message: antdMessage } = AntdApp.useApp();
  const {
    articleList,
    cateList,
    getArticleCateList,
    getArticleCounts,
    getArticleList,
    getTempArticleList,
    articleLoading,
    isTempCategory,
    isTrashCategory,
    articleHasMore,
    setCurrentPage,
    total,
  } = useContext(ArticleContext);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // AI总结相关状态
  const [showAISummarizeModal, setShowAISummarizeModal] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [articleSummary, setArticleSummary] = useState('');

  // 点击查看详情 -> AI总结
  const gotoDetail = (article: any) => {
    if (isTempCategory) {
      // 临时文章点击 URL 跳转系统浏览器
      if (article.url) {
        openExternalUrl(article.url);
      }
    } else {
      if (!article.id) return;
      setShowAISummarizeModal(true);
      setSummarizing(true);
      setArticleSummary('');

      // 发起普通请求
      request
        .get(`/article/summarize?id=${article.id}`)
        .then((data) => {
          if (data.code === 0 && data.data?.summary) {
            setArticleSummary(data.data.summary);
          } else {
            antdMessage.error('生成文章总结失败，请重试');
            setShowAISummarizeModal(false);
          }
        })
        .catch((err) => {
          antdMessage.error('生成文章总结失败，请重试');
          setShowAISummarizeModal(false);
          console.log(err);
        })
        .finally(() => {
          setSummarizing(false);
        });
    }
  };

  // 打开 URL（在系统浏览器中打开）
  const openUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url) {
      openExternalUrl(url);
    }
  };

  const [previewImgUrl, setPreviewImgUrl] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);

  // 生成图片 Modal 状态
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [selectedArticleForImage, setSelectedArticleForImage] = useState<{
    id: number;
    title: string;
    desc?: string;
  } | null>(null);

  // 图片预览，类似于antd的Image组件的预览能力
  const previewImage = (imgUrl: string) => {
    setPreviewImgUrl(imgUrl);
    setPreviewVisible(true);
  };

  // 触发生成图片
  const handleGenerateImage = (data: any) => {
    setSelectedArticleForImage({ id: data.id, title: data.title, desc: data.desc });
    setGenerateModalVisible(true);
  };

  const handleImageGenerated = async (cloudUrl: string) => {
    if (!selectedArticleForImage) return;

    try {
      // 调用更新文章接口，保存图片URL
      const response = await request.post<any>('/article/update', {
        id: selectedArticleForImage.id,
        image: cloudUrl,
      });

      if (response.code === 0) {
        antdMessage.success('图片已保存到文章');
      } else {
        antdMessage.error(response.message || '保存图片失败');
      }
    } catch (error) {
      console.error('保存文章图片失败:', error);
      antdMessage.error('保存图片失败');
    } finally {
      setGenerateModalVisible(false);
      setSelectedArticleForImage(null);
      handleStatusUpdate();
    }
  };

  // 渲染头像
  const renderAvatar = (data: any) => {
    const color = '#1677ff';
    if (data.image) {
      return <GithubFilled style={{ fontSize: 28, color: 'red' }} onClick={() => previewImage(data.image)} />;
    }
    // 无图片时点击触发生成图片
    return <GithubFilled style={{ fontSize: 28, color }} onClick={() => handleGenerateImage(data)} />;
  };

  // 渲染标题
  const renderTitle = (data: any) => {
    // 文章显示标题和 URL 图标
    const { title, url } = data;
    const titleTxt = title.length > 60 ? title.substring(0, 60) + '...' : title;

    return (
      <div className={style.listTitle} onClick={() => gotoDetail(data)}>
        <span>{titleTxt}</span>
        {url && <LinkOutlined className={style.urlIcon} onClick={(e) => openUrl(e, url)} title="在浏览器中打开" />}
      </div>
    );
  };

  // 渲染描述
  const renderDesc = (data: any) => {
    if (isTempCategory) {
      // 临时文章显示加入时间
      return <div className={style.listDesc}>{data.url}</div>;
    }

    let displayDesc = !data.desc ? '该文章暂时没有详细信息' : data.desc.replace(/(<([^>]+)>)/gi, '');
    if (displayDesc.length > 50) {
      displayDesc = displayDesc.substring(0, 50);
    }
    // 获取文章分类
    const cateName = cateList.find((item: any) => item.id === data.cateId)?.name || '未分类';
    displayDesc = `[${cateName}] ${displayDesc}`;
    return (
      <div className={style.listDesc} onClick={() => gotoDetail(data)}>
        {displayDesc}
      </div>
    );
  };

  const handleStatusUpdate = () => {
    setCurrentPage(1); // 回到第一页
    getArticleCounts();
    getArticleList();
    getArticleCateList();
  };

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (articleHasMore && !articleLoading) {
      getArticleList(true);
    }
  }, [articleHasMore, articleLoading, getArticleList, getTempArticleList]);

  // 使用 Intersection Observer 监听触底
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && articleHasMore && !articleLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [articleHasMore, articleLoading, handleLoadMore]);

  // 加载中且列表为空时不渲染任何内容
  if (!articleList?.length && articleLoading) {
    return null;
  }

  if (!articleList?.length) {
    return (
      <div className={style.listContainer} style={{ paddingTop: 100 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={isTempCategory ? '没有任何临时文章' : isTrashCategory ? '回收站是空的' : '没有任何文章'}
        />
      </div>
    );
  }

  return (
    <div className={style.listContainer}>
      <List
        loading={false}
        itemLayout={`horizontal`}
        dataSource={articleList}
        renderItem={(item: any) => (
          <List.Item
            extra={
              <div className={style.listExtra}>
                <span className={style.extraText}>{`created: ${timeAgoFormat(item.createdAt)}`}</span>
                <div className={style.extraActions}>
                  <Actions selectedArticle={item} onUpdated={handleStatusUpdate} />
                </div>
              </div>
            }
          >
            <List.Item.Meta avatar={renderAvatar(item)} title={renderTitle(item)} description={renderDesc(item)} />
          </List.Item>
        )}
      />
      {/* 加载更多触发区域 */}
      <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '16px 0' }}>
        {!articleHasMore && articleList.length > 0 && (
          <span style={{ color: 'var(--ant-color-text-description)' }}>没有更多数据了（共 {total} 条）</span>
        )}
      </div>

      <Drawer
        title={summarizing ? '正在生成AI总结...' : 'AI总结结果'}
        placement="right"
        open={showAISummarizeModal}
        onClose={() => setShowAISummarizeModal(false)}
        size={800}
        destroyOnHidden={true}
      >
        {summarizing && (
          <div className={style.loadingContainer}>
            <Spin size="large" />
            <p className={style.loadingText}>AI正在分析文章，请稍候...</p>
          </div>
        )}

        {!summarizing && articleSummary && <MarkdownPreview content={articleSummary} />}
      </Drawer>

      {/* 隐藏的 Image 组件，用于触发图片预览 */}
      <Image
        style={{ display: 'none' }}
        src={previewImgUrl}
        preview={{
          open: previewVisible,
          onOpenChange: (visible) => setPreviewVisible(visible),
        }}
      />

      {/* 生成图片 Modal */}
      <GenerateImage
        visible={generateModalVisible}
        title={selectedArticleForImage?.title || ''}
        summary={selectedArticleForImage?.desc}
        onClose={() => {
          setGenerateModalVisible(false);
          setSelectedArticleForImage(null);
        }}
        onSuccess={handleImageGenerated}
      />
    </div>
  );
};

export default memo(Articles);
