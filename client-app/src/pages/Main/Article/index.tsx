import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';

import { ActivityIndicator, Toast } from '@ant-design/react-native';
import { format as timeAgoFormat } from 'timeago.js';

import ArticleService from '@services/ArticleService';
import type { Article } from '@services/ArticleService';

import Empty from '@components/Empty';
import ListItem from '@components/ListItem';
import ButtonGroup from '@/components/ButtonGroup';
import Popup from '@/components/Popup';

import Detail from './Detail';

import styles from './styles';

const PAGE_SIZE = 20;

const options = [
  { label: '所有文章', value: 'all' },
  { label: '临时文章', value: 'temp' },
  { label: '回收站', value: 'trash' },
];

const ArticlePage = () => {
  const [ArticleType, setArticleType] = useState<string>('all');
  const [ArticleList, setArticleList] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [operator, setOperator] = useState<string>('');

  useEffect(() => {
    // todo something
    console.log('Article Page inited');
  }, []);

  // 当选中的时间变化时候，重新加载数据
  useEffect(() => {
    loadArticleList(1, true);
  }, [ArticleType]);

  // 加载文章列表
  const loadArticleList = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // 使用统一的方法处理分页和搜索
      const result = await ArticleService.getArticleList(pageNum, PAGE_SIZE, ArticleType || undefined);

      if (pageNum === 1) {
        setArticleList(result.data);
        setRefreshing(false);
      } else {
        setArticleList(prev => [...prev, ...result.data]);
      }
      
      // 更新总数和是否有更多数据
      setHasMore(result.data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (error) {
      Toast.fail('获取文章列表失败');
      console.error('Error fetching Article list:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 选中笔记时间
  const handleArticleTypeChange = (value: string) => {
    setArticleType(value);
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadArticleList(1, true);
  };

  // 触底加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadArticleList(page + 1);
    }
  };

  // 查看笔记详情
  const handleArticlePress = (Article: Article) => {
    setSelectedArticle(Article);
    setOperator('detail');
  };

  // 关闭模态框
  const closeModal = () => {
    setSelectedArticle(null);
    setOperator('');
  };

  // 渲染笔记列表中一条笔记信息
  const renderArticleItem = ({ item }: { item: Article }) => (
    <ListItem
      title={
        <Text style={{ fontSize: 16, color: '#333'}}>
          {item.title ? item.title.substring(0, 18) + (item.title.length > 18 ? '...' : '') : ''}
        </Text>
      }
      subtitle={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#999' }}>
            {item.desc ? item.desc.substring(0, 20) + (item.desc.length > 20 ? '...' : '') : ''}
          </Text>
        </View>
      }
      extra={
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: '#666' }}>{timeAgoFormat(new Date(item.createdAt))}</Text>
        </View>
      }
      onPress={() => handleArticlePress(item)}
    />
  );

  // 渲染文章列表底部加载更多组件
  const renderArticleListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size={`small`} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <ButtonGroup options={options} onChange={handleArticleTypeChange} />
      </View>
      
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={`large`} />
        </View>
      ) : ArticleList.length === 0 ? (
        <Empty text={`暂无文章数据`} />
      ) : (
        <FlatList
          data={ArticleList}
          keyExtractor={(item: Article, index: number) => `${item.id}-${index}`}
          renderItem={renderArticleItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderArticleListFooter}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Popup
        visible={!!selectedArticle && operator === 'detail'}
        onClose={closeModal}
        content={selectedArticle ? <Detail articleId={selectedArticle?.id} /> : null}
        showCloseBtn={true}
      />

    </View>
  );

};

export default ArticlePage;
