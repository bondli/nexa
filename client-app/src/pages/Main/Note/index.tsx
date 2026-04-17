import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';

import { ActivityIndicator, Toast } from '@ant-design/react-native';
import { format as timeAgoFormat } from 'timeago.js';

import NoteService from '@services/NoteService';
import type { Note } from '@services/NoteService';

import Empty from '@components/Empty';
import ListItem from '@components/ListItem';
import ButtonGroup from '@/components/ButtonGroup';
import Popup from '@/components/Popup';

import Detail from './Detail';
import CreateNoteForm from './CreateNoteForm';

import styles from './styles';

const PAGE_SIZE = 20;

const options = [
  { label: '所有笔记', value: 'all' },
  { label: '今天到期', value: 'today' },
  { label: '已完成', value: 'done' },
  { label: '回收站', value: 'trash' },
];

const NotePage = () => {
  const [NoteType, setNoteType] = useState<string>('all');
  const [NoteList, setNoteList] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [operator, setOperator] = useState<string>('');

  // 创建笔记弹层状态
  const [createNoteVisible, setCreateNoteVisible] = useState<boolean>(false);

  useEffect(() => {
    // todo something
    console.log('Note Page inited');
  }, []);

  // 当选中的时间变化时候，重新加载数据
  useEffect(() => {
    loadNoteList(1, true);
  }, [NoteType]);

  // 加载笔记列表
  const loadNoteList = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // 使用统一的方法处理分页和搜索
      const result = await NoteService.getNoteList(pageNum, PAGE_SIZE, NoteType || undefined);

      if (pageNum === 1) {
        setNoteList(result.data);
        setRefreshing(false);
      } else {
        setNoteList(prev => [...prev, ...result.data]);
      }
      
      // 更新总数和是否有更多数据
      setHasMore(result.data.length === PAGE_SIZE);
      setPage(pageNum);
    } catch (error) {
      Toast.fail('获取笔记列表失败');
      console.error('Error fetching Note list:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 选中笔记时间
  const handleNoteTypeChange = (value: string) => {
    setNoteType(value);
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    loadNoteList(1, true);
  };

  // 触底加载更多
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadNoteList(page + 1);
    }
  };

  // 查看笔记详情
  const handleNotePress = (Note: Note) => {
    setSelectedNote(Note);
    setOperator('detail');
  };

  // 关闭模态框
  const closeModal = () => {
    setSelectedNote(null);
    setOperator('');
  };

  // 打开创建笔记弹层
  const handleOpenCreateNote = () => {
    setCreateNoteVisible(true);
  };

  // 关闭创建笔记弹层
  const handleCloseCreateNote = () => {
    setCreateNoteVisible(false);
  };

  // 创建笔记成功回调
  const handleCreateNoteSuccess = () => {
    setCreateNoteVisible(false);
    // 刷新列表
    loadNoteList(1, true);
  };

  // 渲染笔记列表中一条笔记信息
  const renderNoteItem = ({ item }: { item: Note }) => (
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
      onPress={() => handleNotePress(item)}
    />
  );

  // 渲染笔记列表底部加载更多组件
  const renderNoteListFooter = () => {
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
        <ButtonGroup options={options} onChange={handleNoteTypeChange} />
      </View>
      
      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={`large`} />
        </View>
      ) : NoteList.length === 0 ? (
        <Empty text={`暂无笔记数据`} />
      ) : (
        <FlatList
          data={NoteList}
          keyExtractor={(item: Note, index: number) => `${item.id}-${index}`}
          renderItem={renderNoteItem}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderNoteListFooter}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Popup
        visible={!!selectedNote && operator === 'detail'}
        onClose={closeModal}
        content={selectedNote ? <Detail noteId={selectedNote?.id} /> : null}
        showCloseBtn={true}
      />

      {/* 创建笔记弹层 */}
      <Popup
        visible={createNoteVisible}
        onClose={handleCloseCreateNote}
        content={<CreateNoteForm onSuccess={handleCreateNoteSuccess} onCancel={handleCloseCreateNote} />}
        showCloseBtn={false}
      />

      {/* 浮动按钮 */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenCreateNote} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </View>
  );

};

export default NotePage;
