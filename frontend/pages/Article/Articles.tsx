import React, { memo, useContext } from 'react';
import { List, Empty } from 'antd';
import { GithubFilled, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { format as timeAgoFormat } from 'timeago.js';
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
    articleLoading,
    isTempCategory,
    isTrashCategory,
  } = useContext(ArticleContext);

  // 点击查看详情
  const gotoDetail = (data: any) => {
    if (isTempCategory) {
      // 临时文章点击 URL 跳转浏览器
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } else {
      setSelectedArticle(data);
    }
  };

  // 打开 URL（在浏览器中打开）
  const openUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 渲染头像
  const renderAvatar = () => {
    const color = '#1677ff';
    return <GithubFilled style={{ fontSize: 28, color }} />;
  };

  // 渲染标题
  const renderTitle = (data: any) => {
    if (isTempCategory) {
      // 临时文章只显示 URL
      const urlText = data.url.length > 50 ? data.url.substring(0, 50) + '...' : data.url;
      return (
        <div className={style.listTitle} onClick={(e) => openUrl(e, data.url)}>
          <span style={{ color: '#1890ff', cursor: 'pointer' }}>{urlText}</span>
        </div>
      );
    }

    // 普通文章显示标题和 URL 图标
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
      return (
        <div className={style.listDesc}>
          加入时间：{data.createdAt ? dayjs(data.createdAt).format('YYYY/MM/DD HH:mm') : '-'}
        </div>
      );
    }

    let displayDesc = !data.desc ? '该文章暂时没有详细信息' : data.desc.replace(/(<([^>]+)>)/gi, '');
    if (displayDesc.length > 50) {
      displayDesc = displayDesc.substring(0, 50);
    }
    return <div className={style.listDesc}>{displayDesc}</div>;
  };

  const handleStatusUpdate = () => {
    getArticleCounts();
    getArticleList();
    getArticleCateList();
  };

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
        loading={articleLoading}
        itemLayout={`horizontal`}
        dataSource={articleList}
        renderItem={(item: any) => (
          <List.Item
            extra={
              <div className={style.listExtra}>
                <span className={style.extraText}>
                  {isTempCategory ? '' : `created: ${timeAgoFormat(item.createdAt)}`}
                </span>
                {!isTempCategory && (
                  <div className={style.extraActions}>
                    <Actions selectedArticle={item} onUpdated={handleStatusUpdate} />
                  </div>
                )}
              </div>
            }
          >
            <List.Item.Meta avatar={renderAvatar()} title={renderTitle(item)} description={renderDesc(item)} />
          </List.Item>
        )}
      />
    </div>
  );
};

export default memo(Articles);
