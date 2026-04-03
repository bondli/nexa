import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { notification, Input, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { userLog } from '@commons/electron';
import { NoteContext } from './context';
import { DEFAULT_CATE } from './constant';

const SearchBox: React.FC = () => {
  const { message } = App.useApp();
  const { currentCate, setCurrentCate, selectedNote, setNoteList } = useContext(NoteContext);

  const [searchKey, setSearchKey] = useState('');
  const inputSearchRef = useRef(null);

  // 搜索框输入
  const handleSearchChange = (e) => {
    setSearchKey(e.target.value);
  };

  // 执行搜索
  const goSearch = async () => {
    // 强制切换到All的目录下
    setCurrentCate(DEFAULT_CATE);

    userLog('Search Note keyword: ', searchKey);
    message.loading('搜索中...', 2);
    // 延迟2s，解决切换到All分类带来的副作用
    setTimeout(async () => {
      const response = await request.post(`/note/searchList?cateId=${currentCate.id}`, {
        searchKey,
      });
      const { data, status } = response;
      if (status === 200) {
        if (data.count > 0) {
          notification.success({
            message: `搜索到“${searchKey}”的结果共 ${data.count} 条`,
          });
        } else {
          notification.info({
            message: `没有搜索到“${searchKey}”的结果`,
          });
        }
        setNoteList(data.data || []);
      }
    }, 2500);
  };

  useEffect(() => {
    setSearchKey('');
  }, [currentCate.id, selectedNote?.id]);

  return (
    <div>
      <Input
        style={{ width: 300 }}
        size={`small`}
        placeholder={`请输入关键字进行查找`}
        prefix={<SearchOutlined />}
        allowClear
        onChange={handleSearchChange}
        onPressEnter={goSearch}
        value={searchKey}
        ref={inputSearchRef}
      />
    </div>
  );
};

export default memo(SearchBox);
