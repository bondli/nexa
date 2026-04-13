import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator, Toast, List } from '@ant-design/react-native';

import NoteService from '@services/NoteService';
import type { Note } from '@services/NoteService';
import Empty from '@components/Empty';

import styles from './styles';

interface DetailProps {
  noteId: number;
}

const Detail = (props: DetailProps) => {
  const { noteId = 0 } = props;
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [NoteDetail, setNoteDetail] = useState<Note | null>(null); // 订单详细信息

  // 加载订单详情
  const loadNoteDetail = async (NoteId: number) => {
    try {
      setDetailLoading(true);
      const detail = await NoteService.getNoteDetail(NoteId);
      setNoteDetail(detail.detailInfo);
    } catch (error) {
      Toast.fail('获取订单详情失败');
      console.error('Error fetching Note detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    console.log('NoteDetail Component inited');
  }, []);

  useEffect(() => {
    if (noteId) {
      loadNoteDetail(noteId);
    }
  }, [noteId]);

  if (detailLoading) {
    return (
      <View style={{ paddingTop: 100 }}>
        <ActivityIndicator size={`large`} />
      </View>
    );
  }

  if (!NoteDetail) {
    return (
      <View style={{ paddingTop: 100 }}>
        <Empty text={'网络错误，请重试'} />
      </View>
    );
  }

  return (
    <View style={styles.detailContainer}>
      <List renderHeader={'订单详情'}>
        <List.Item extra={NoteDetail.id} arrow={`empty`}>
          id
        </List.Item>
        <List.Item extra={NoteDetail.createdAt} arrow={`empty`}>
          时间
        </List.Item>
        <List.Item extra={NoteDetail.desc || '---'} arrow={`empty`}>
          备注
        </List.Item>
      </List>
    </View>
  );
};

export default Detail;