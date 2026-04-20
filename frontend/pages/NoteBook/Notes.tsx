import React, { memo, useContext, useEffect, useRef, useCallback } from 'react';
import { List, Empty } from 'antd';
import { GithubFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { format as timeAgoFormat } from 'timeago.js';
import { NoteContext } from './context';
import Actions from './Actions';
import style from './index.module.less';

const Notes: React.FC = () => {
  const { noteList, setSelectedNote, getCateList, getNoteCounts, getNoteList, notesLoading, notesHasMore, notesTotal } =
    useContext(NoteContext);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 点击查看详情
  const gotoDetail = (data: any) => {
    setSelectedNote(data);
  };

  // 笔记头像
  const renderAvatar = (data: any) => {
    const color: { [key: number]: string } = {
      1: 'red',
      2: '#faad14',
      3: '#1677ff',
      4: 'gray',
    };
    const { priority, status } = data;
    let finalColor = '';
    if (status === 'done') {
      finalColor = 'green';
    } else if (status === 'deleted') {
      finalColor = 'gray';
    } else {
      finalColor = color[priority] || 'gray';
    }
    return <GithubFilled style={{ fontSize: 28, color: finalColor }} />;
  };

  // 笔记标题
  const renderTitle = (data: any) => {
    const { title, deadline } = data;
    const titleTxt = title.length > 40 ? title.substring(0, 40) + '...' : title;
    let titleContainer = <span>{titleTxt}</span>;
    if (deadline) {
      titleContainer = (
        <span>
          {titleTxt}
          <span className={style.time}>(截止时间：{dayjs(deadline).format('YY/MM/DD HH:mm')})</span>
        </span>
      );
    }

    return (
      <div className={style.listTitle} onClick={() => gotoDetail(data)}>
        {titleContainer}
      </div>
    );
  };

  // 笔记描述
  const renderDesc = (data: any) => {
    let displayDesc = !data.desc
      ? '该笔记暂时没有详细信息，等你来添加详细的信息'
      : data.desc.replace(/(<([^>]+)>)/gi, '');
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
    getNoteCounts();
    getNoteList();
    getCateList();
  };

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (notesHasMore && !notesLoading) {
      getNoteList(true);
    }
  }, [notesHasMore, notesLoading, getNoteList]);

  // 使用 Intersection Observer 监听触底
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && notesHasMore && !notesLoading) {
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
  }, [notesHasMore, notesLoading, handleLoadMore]);

  // 加载中且列表为空时不渲染任何内容
  if (!noteList?.length && notesLoading) {
    return null;
  }

  if (!noteList?.length) {
    return (
      <div className={style.listContainer} style={{ paddingTop: 100 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={`没有任何笔记`} />
      </div>
    );
  }

  return (
    <div className={style.listContainer}>
      <List
        loading={false}
        itemLayout={`horizontal`}
        dataSource={noteList}
        renderItem={(item) => (
          <List.Item
            extra={
              <div className={style.listExtra}>
                <span className={style.extraText}>created: {timeAgoFormat(item.createdAt)}</span>
                <div className={style.extraActions}>
                  <Actions selectedNote={item} onUpdated={handleStatusUpdate} />
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
        {!notesHasMore && noteList.length > 0 && (
          <span style={{ color: '#999' }}>没有更多数据了（共 {notesTotal} 条）</span>
        )}
      </div>
    </div>
  );
};

export default memo(Notes);
