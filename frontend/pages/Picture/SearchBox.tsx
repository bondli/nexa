import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Input, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { userLog } from '@commons/electron';
import { PictureContext } from './context';

const SearchBox: React.FC = () => {
  const { message, notification } = App.useApp();
  const { currentCate, setPictureList } = useContext(PictureContext);

  const [searchKey, setSearchKey] = useState('');
  const inputSearchRef = useRef(null);

  // 搜索框输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(e.target.value);
  };

  // 执行搜索
  const goSearch = async () => {
    if (!searchKey.trim()) {
      // 清空搜索时重新获取列表（由外部监听 currentCate 变化处理）
      setSearchKey('');
      return;
    }

    userLog('Search Picture keyword: ', searchKey);
    message.loading('搜索中...', 2);

    // 延迟解决切换分类带来的副作用
    setTimeout(async () => {
      const response = await request.get(`/picture/search?keyword=${encodeURIComponent(searchKey.trim())}`);
      if (response.code === 0) {
        const { data, count } = response;
        // 设置搜索结果到列表
        setPictureList(data || []);
        // 显示搜索结果通知
        if (count > 0) {
          notification.success({
            message: `搜索到"${searchKey}"的结果共 ${count} 条`,
          });
        } else {
          notification.info({
            message: `没有搜索到"${searchKey}"的结果`,
          });
        }
      }
    }, 2500);
  };

  // 分类变化时清空搜索
  useEffect(() => {
    setSearchKey('');
  }, [currentCate?.id]);

  return (
    <div>
      <Input
        style={{ width: 200 }}
        size={`small`}
        placeholder={`搜索图片名称`}
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
