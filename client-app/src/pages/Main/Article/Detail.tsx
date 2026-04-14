import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Toast, List } from '@ant-design/react-native';

import ArticleService from '@services/ArticleService';
import type { Article } from '@services/ArticleService';
import Empty from '@components/Empty';

import styles from './styles';

interface DetailProps {
  articleId: number;
}

const Detail = (props: DetailProps) => {
  const { articleId = 0 } = props;
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [ArticleDetail, setArticleDetail] = useState<Article | null>(null); // 订单详细信息

  // 加载文章详情
  const loadArticleDetail = async (ArticleId: number) => {
    try {
      setDetailLoading(true);
      const detail = await ArticleService.getArticleDetail(ArticleId);
      setArticleDetail(detail.detailInfo);
    } catch (error) {
      Toast.fail('获取文章详情失败');
      console.error('Error fetching Article detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    console.log('ArticleDetail Component inited');
  }, []);

  useEffect(() => {
    if (articleId) {
      loadArticleDetail(articleId);
    }
  }, [articleId]);

  if (detailLoading) {
    return (
      <View style={{ paddingTop: 100 }}>
        <ActivityIndicator size={`large`} />
      </View>
    );
  }

  if (!ArticleDetail) {
    return (
      <View style={{ paddingTop: 100 }}>
        <Empty text={'网络错误，请重试'} />
      </View>
    );
  }

  return (
    <View style={styles.detailContainer}>
      <List renderHeader={'文章详情'}>
        <List.Item extra={`${ArticleDetail.id}`} arrow={`empty`}>
          id
        </List.Item>
        <List.Item extra={ArticleDetail.createdAt} arrow={`empty`}>
          时间
        </List.Item>
        <List.Item extra={ArticleDetail.url} arrow={`empty`}>
          url
        </List.Item>
        <List.Item extra={ArticleDetail.desc ? '如下' : '--'} arrow={`empty`}>
          详情
        </List.Item>
      </List>
      <View style={styles.detailContent}>
        <Text>{ArticleDetail.desc}</Text>
      </View>
    </View>
  );
};

export default Detail;