import React, { memo, useState, useRef } from 'react';
import { Input, App } from 'antd';
import dayjs from 'dayjs';
import { format as timeAgoFormat } from 'timeago.js';
import { throttle, debounce } from 'lodash-es';
import request from '@commons/request';
import { userLog } from '@commons/electron';
import MarkdownEditor from './MarkdownEditor/index';
import style from './index.module.less';

// 将节流函数定义在组件外部，确保复用同一个实例
// 3秒节流：频繁输入时最多每3秒保存一次
const saveArticleChange = throttle((value, handleSaveContent) => {
  if (!value || value.trim() === '') {
    return;
  }
  handleSaveContent(value);
}, 3000);

// 防抖：首次输入后1秒触发保存，确保用户开始输入后能快速保存
const triggerFirstSave = debounce(() => {
  saveArticleChange.flush();
}, 1000);

type DetailProps = {
  selectedNote: any;
};

const Detail: React.FC<DetailProps> = (props) => {
  const { message } = App.useApp();
  const { selectedNote } = props;

  const [showEditTitle, setShowEditTitle] = useState(false);
  const inputRef = useRef(null);

  const [tempTitle, setTempTitle] = useState<string>(selectedNote?.title || '');
  const [tempDesc, setTempDesc] = useState<string>(selectedNote?.desc || '');

  // 设置标题输入框出现
  const handleEditTitle = () => {
    setShowEditTitle(true);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    }, 200);
  };

  // 提交服务端修改标题
  const saveTitleChange = (e) => {
    const tempTitle = e.target.value;
    if (!tempTitle || !tempTitle.length) {
      message.error('请输入代办/笔记/文章标题');
      return;
    }
    request
      .post(`/note/update`, {
        id: selectedNote.id,
        title: tempTitle,
      })
      .then(() => {
        setShowEditTitle(false);
        setTempTitle(tempTitle);
        userLog(`Note Title Saved Successful`);
      })
      .catch((err) => {
        message.error(`修改失败：${err.message}`);
      });
  };

  // 保存内容到服务器
  const handleSaveContent = (value: string) => {
    // 内容无修改的时候不做无用的保存
    if (tempDesc === value) {
      return;
    }
    request.post(`/note/update`, {
      id: selectedNote.id,
      desc: value,
    });
  };

  // 内容输入，直接更新
  const handleChange = (value: string) => {
    setTempDesc(value);
    // 使用防抖触发首次保存
    triggerFirstSave();
    // 使用节流函数进行保存
    saveArticleChange(value, handleSaveContent);
  };

  // 失去焦点时立即保存
  const handleBlur = () => {
    // 取消防抖，确保最后一次内容被保存
    triggerFirstSave.cancel();
    saveArticleChange.cancel();
    // 立即保存当前内容
    handleSaveContent(tempDesc);
  };

  return (
    <div className={style.detail}>
      <div className={style.titleContainer}>
        {showEditTitle ? (
          <div className={style.left}>
            <Input
              ref={inputRef}
              placeholder={`请输入标题`}
              defaultValue={tempTitle}
              onPressEnter={saveTitleChange}
              onBlur={() => {
                setShowEditTitle(false);
              }}
              style={{ width: '90%' }}
            />
          </div>
        ) : (
          <div className={style.left}>
            <span onClick={handleEditTitle}>{tempTitle}</span>
            <div className={style.titleTips}>update at: {timeAgoFormat(selectedNote.updatedAt)}</div>
          </div>
        )}

        <div className={style.right}>
          <span>{dayjs(selectedNote.createdAt).format('YY/MM/DD HH:mm')}</span>
        </div>
      </div>

      <div className={style.articleContainer}>
        <MarkdownEditor value={tempDesc} onChange={handleChange} onBlur={handleBlur} />
      </div>
    </div>
  );
};

export default memo(Detail);
