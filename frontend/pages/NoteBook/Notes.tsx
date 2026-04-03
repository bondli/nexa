import React, { memo, useContext } from 'react';
import { List, Empty } from 'antd';
import { GithubFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import { format as timeAgoFormat } from 'timeago.js';
import { NoteContext } from './context';
import Actions from './Actions';
import style from './index.module.less';

const Notes: React.FC = () => {
  const { noteList, setSelectedNote, getCateList, getNoteCounts, getNoteList, notesLoading } = useContext(NoteContext);

  // 点击查看详情
  const gotoDetail = (data) => {
    setSelectedNote(data);
  };

  // 笔记头像
  const renderAvatar = (data) => {
    const color = {
      1: 'red',
      2: '#faad14',
      3: '#1677ff',
      4: 'gray',
    };
    const { priority, status } = data;
    // 如果状态是done显示绿色，deleted显示灰色，其他按照优先级的颜色来
    let finalColor = '';
    if (status === 'done') {
      finalColor = 'green';
    } else if (status === 'deleted') {
      finalColor = 'gray';
    } else {
      finalColor = color[priority];
    }
    return <GithubFilled style={{ fontSize: 28, color: finalColor }} />;
  };

  // 笔记标题
  const renderTitle = (data) => {
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
  const renderDesc = (data) => {
    // 去掉html的标签，展示纯文本
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
        loading={notesLoading}
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
    </div>
  );
};

export default memo(Notes);
