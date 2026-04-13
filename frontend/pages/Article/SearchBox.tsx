import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Input, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { userLog } from '@commons/electron';
import { ArticleContext } from './context';
import { DEFAULT_CATE } from './constant';

const SearchBox: React.FC = () => {
  const { message, notification } = App.useApp();
  const { currentCate, setCurrentCate, selectedArticle, setArticleList, isTempCategory, isTrashCategory } =
    useContext(ArticleContext);

  const [searchKey, setSearchKey] = useState('');
  const inputSearchRef = useRef(null);

  // 搜索框输入
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(e.target.value);
  };

  // 执行搜索
  const goSearch = async () => {
    // 临时文章和回收站不支持搜索
    if (isTempCategory || isTrashCategory) {
      message.info('临时文章和回收站不支持搜索');
      return;
    }
    // 强制切换到 All 的目录下
    setCurrentCate(DEFAULT_CATE);

    userLog('Search Article keyword: ', searchKey);
    message.loading('搜索中...', 2);
    // 延迟解决切换到 All 分类带来的副作用
    setTimeout(async () => {
      const response = await request.post(`/article/searchList?cateId=${currentCate.id}`, {
        searchKey,
      });
      if (response.code === 0) {
        const { data, count } = response;
        if (count > 0) {
          notification.success({
            description: `搜索到"${searchKey}"的结果共 ${count} 条`,
          });
        } else {
          notification.info({
            description: `没有搜索到"${searchKey}"的结果`,
          });
        }
        setArticleList(data || []);
      }
    }, 2500);
  };

  useEffect(() => {
    setSearchKey('');
  }, [currentCate.id, selectedArticle?.id]);

  // 临时文章和回收站不显示搜索框
  if (isTempCategory || isTrashCategory) {
    return null;
  }

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
