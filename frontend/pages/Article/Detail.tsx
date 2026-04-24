import React, { memo, useState, useRef, useEffect } from 'react';
import { Input, App } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { format as timeAgoFormat } from 'timeago.js';
import { throttle, debounce } from 'lodash-es';
import request from '@commons/request';
import { userLog } from '@commons/electron';
import MarkdownEditor from '@components/MarkdownEditor/index';
import style from './index.module.less';

// 3秒节流：频繁输入时最多每3秒保存一次
const saveArticleChange = throttle((value, handleSaveContent) => {
  if (!value || value.trim() === '') {
    return;
  }
  handleSaveContent(value);
}, 3000);

// 防抖：首次输入后1秒触发保存
const triggerFirstSave = debounce(() => {
  saveArticleChange.flush();
}, 1000);

type DetailProps = {
  selectedArticle: any;
};

const Detail: React.FC<DetailProps> = (props) => {
  const { message } = App.useApp();
  const { selectedArticle } = props;

  const [showEditTitle, setShowEditTitle] = useState(false);
  const inputRef = useRef(null);

  const [tempTitle, setTempTitle] = useState<string>(selectedArticle?.title || '');
  const [tempDesc, setTempDesc] = useState<string>(selectedArticle?.desc || '');
  const [tempUrl, setTempUrl] = useState<string>(selectedArticle?.url || '');

  // 监听选中文章变化
  useEffect(() => {
    setTempTitle(selectedArticle?.title || '');
    setTempDesc(selectedArticle?.desc || '');
    setTempUrl(selectedArticle?.url || '');
  }, [selectedArticle]);

  // 设置标题输入框出现
  const handleEditTitle = () => {
    setShowEditTitle(true);
    setTimeout(() => {
      inputRef?.current?.focus();
      inputRef?.current?.select();
    }, 200);
  };

  // 提交服务端修改标题
  const saveTitleChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const tempTitleValue = e.currentTarget.value;
    if (!tempTitleValue || !tempTitleValue.length) {
      message.error('请输入文章标题');
      return;
    }
    request
      .post(`/article/update`, {
        id: selectedArticle.id,
        title: tempTitleValue,
      })
      .then(() => {
        setShowEditTitle(false);
        setTempTitle(tempTitleValue);
        userLog(`Article Title Saved Successful`);
      })
      .catch((err) => {
        message.error(`修改失败：${err.message}`);
      });
  };

  // 保存内容到服务器
  const handleSaveContent = (value: string) => {
    if (tempDesc === value) {
      return;
    }
    request.post(`/article/update`, {
      id: selectedArticle.id,
      desc: value,
    });
  };

  // 内容输入
  const handleChange = (value: string) => {
    setTempDesc(value);
    triggerFirstSave();
    saveArticleChange(value, handleSaveContent);
  };

  // 失去焦点时立即保存
  const handleBlur = () => {
    triggerFirstSave.cancel();
    saveArticleChange.cancel();
    handleSaveContent(tempDesc);
  };

  // 在浏览器中打开 URL
  const openUrl = () => {
    if (tempUrl) {
      window.open(tempUrl, '_blank');
    }
  };

  // 保存 URL 修改
  const saveUrl = (urlValue: string) => {
    request
      .post(`/article/update`, {
        id: selectedArticle.id,
        url: urlValue,
      })
      .then(() => {
        setTempUrl(urlValue);
        userLog(`Article URL Saved Successful`);
      })
      .catch((err) => {
        message.error(`修改URL失败：${err.message}`);
      });
  };

  const saveUrlChange = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    saveUrl(e.currentTarget.value);
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
            <div className={style.titleTips}>update at: {timeAgoFormat(selectedArticle.updatedAt)}</div>
          </div>
        )}

        <div className={style.right}>
          <span>{dayjs(selectedArticle.createdAt).format('YY/MM/DD HH:mm')}</span>
        </div>
      </div>

      {/* URL 显示和编辑 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e5e5' }}>
        <Input
          placeholder="请输入文章链接"
          value={tempUrl}
          onChange={(e) => setTempUrl(e.target.value)}
          onBlur={saveUrlChange}
          onPressEnter={saveUrlChange}
          prefix={<LinkOutlined />}
          suffix={
            tempUrl ? (
              <LinkOutlined style={{ cursor: 'pointer', color: '#1890ff' }} onClick={openUrl} title="在浏览器中打开" />
            ) : null
          }
        />
      </div>

      <div className={style.articleContainer}>
        <MarkdownEditor value={tempDesc} onChange={handleChange} onBlur={handleBlur} />
      </div>
    </div>
  );
};

export default memo(Detail);
