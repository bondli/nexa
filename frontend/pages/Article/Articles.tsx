import React, { memo, useContext, useEffect, useRef, useCallback } from 'react';
import { List, Empty } from 'antd';
import { GithubFilled, LinkOutlined } from '@ant-design/icons';
import { format as timeAgoFormat } from 'timeago.js';
import { openExternalUrl } from '@commons/electron';
import { ArticleContext } from './context';
import Actions from './Actions';
import style from './index.module.less';

const Articles: React.FC = () => {
  const {
    articleList,
    setSelectedArticle,
    getArticleCateList,
    getArticleCounts,
    getArticleList,
    getTempArticleList,
    articleLoading,
    isTempCategory,
    isTrashCategory,
    articleHasMore,
    total,
  } = useContext(ArticleContext);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 点击查看详情
  const gotoDetail = (data: any) => {
    if (isTempCategory) {
      // 临时文章点击 URL 跳转系统浏览器
      if (data.url) {
        openExternalUrl(data.url);
      }
    } else {
      setSelectedArticle(data);
    }
  };

  // 打开 URL（在系统浏览器中打开）
  const openUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url) {
      openExternalUrl(url);
    }
  };

  // 渲染头像
  const renderAvatar = () => {
    const color = '#1677ff';
    return <GithubFilled style={{ fontSize: 28, color }} />;
  };

  // 渲染标题
  const renderTitle = (data: any) => {
    // 文章显示标题和 URL 图标
    const { title, url } = data;
    const titleTxt = title.length > 40 ? title.substring(0, 40) + '...' : title;

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
    return (
      <div className={style.listDesc} onClick={() => gotoDetail(data)}>
        {displayDesc}
      </div>
    );
  };

  const handleStatusUpdate = () => {
    getArticleCounts();
    getArticleList();
    getArticleCateList();
  };

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (articleHasMore && !articleLoading) {
      if (isTempCategory) {
        getTempArticleList(true);
      } else {
        getArticleList(true);
      }
    }
  }, [articleHasMore, articleLoading, isTempCategory, getArticleList, getTempArticleList]);

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
            <List.Item.Meta avatar={renderAvatar()} title={renderTitle(item)} description={renderDesc(item)} />
          </List.Item>
        )}
      />
      {/* 加载更多触发区域 */}
      <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '16px 0' }}>
        {!articleHasMore && articleList.length > 0 && (
          <span style={{ color: 'var(--ant-color-text-description)' }}>没有更多数据了（共 {total} 条）</span>
        )}
      </div>
    </div>
  );
};

export default memo(Articles);
