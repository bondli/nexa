import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { ActivityIndicator, Toast, Modal, Input, ActionSheet } from '@ant-design/react-native';
import { format as timeAgoFormat } from 'timeago.js';
import NoteService from '@services/NoteService';
import type { Note } from '@services/NoteService';
import Empty from '@components/Empty';
import ListItem from '@components/ListItem';
import Detail from './Detail';
import styles from './styles';
import ButtonGroup from '@/components/ButtonGroup';
import Popup from '@/components/Popup';

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

  // 长按操作的笔记
  const [longPressedNote, setLongPressedNote] = useState<Note | null>(null);

  // 编辑笔记弹窗状态
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');

  useEffect(() => {
    // todo something
    console.log('Note Page inited');
  }, []);

  // 当选中的时间变化时候，重新加载数据
  useEffect(() => {
    loadNoteList(1, true);
  }, [NoteType]);

  // 加载笔记列表
  const loadNoteList = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
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
        setNoteList((prev) => [...prev, ...result.data]);
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
  }, [NoteType]);

  // 选中笔记时间
  const handleNoteTypeChange = useCallback((value: string) => {
    setNoteType(value);
  }, []);

  // 下拉刷新
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadNoteList(1, true);
  }, [loadNoteList]);

  // 触底加载更多
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadNoteList(page + 1);
    }
  }, [loadingMore, hasMore, loadNoteList, page]);

  // 查看笔记详情
  const handleNotePress = useCallback((Note: Note) => {
    setSelectedNote(Note);
    setOperator('detail');
  }, []);

  // 关闭模态框
  const closeModal = useCallback(() => {
    setSelectedNote(null);
    setOperator('');
  }, []);

  // 标记为已完成
  const handleMarkAsDone = useCallback(async (noteId: number) => {
    try {
      await NoteService.updateNoteStatus(noteId, 'done');
      Toast.success('已标记为完成');
      loadNoteList(1, true);
    } catch (error) {
      Toast.fail('操作失败');
      console.error('Error marking note as done:', error);
    }
  }, [loadNoteList]);

  // 删除笔记
  const handleDeleteNote = useCallback((noteId: number) => {
    Alert.alert('确认删除', '确定要删除这条笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await NoteService.deleteNote(noteId);
            Toast.success('删除成功');
            loadNoteList(1, true);
          } catch (error) {
            Toast.fail('删除失败');
            console.error('Error deleting note:', error);
          }
        },
      },
    ]);
  }, [loadNoteList]);

  // 长按笔记，显示操作菜单
  const handleLongPress = useCallback((note: Note) => {
    setLongPressedNote(note);
    const options = ['编辑笔记', '设置为已完成', '删除笔记'];
    const destructiveButtonIndex = 2;

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: 3,
        destructiveButtonIndex,
        title: '笔记操作',
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // 编辑笔记
          setEditTitle(note.title || '');
          setEditDesc(note.desc || '');
          setEditModalVisible(true);
        } else if (buttonIndex === 1) {
          // 设置为已完成
          handleMarkAsDone(note.id);
        } else if (buttonIndex === 2) {
          // 删除笔记
          handleDeleteNote(note.id);
        }
      },
    );
  }, [handleMarkAsDone, handleDeleteNote]);

  // 保存编辑
  const handleSaveEdit = useCallback(async () => {
    if (!longPressedNote) return;
    try {
      await NoteService.updateNote(longPressedNote.id, editTitle, editDesc);
      Toast.success('保存成功');
      setEditModalVisible(false);
      loadNoteList(1, true);
    } catch (error) {
      Toast.fail('保存失败');
      console.error('Error updating note:', error);
    }
  }, [longPressedNote, editTitle, editDesc, loadNoteList]);

  // 关闭编辑弹窗
  const closeEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditTitle('');
    setEditDesc('');
    setLongPressedNote(null);
  }, []);

  // 渲染笔记列表中一条笔记信息
  const renderNoteItem = useCallback(
    ({ item }: { item: Note }) => (
      <ListItem
        title={
          <Text style={{ fontSize: 16, color: '#333' }}>
            {item.title ? item.title.substring(0, 28) + (item.title.length > 28 ? '...' : '') : ''}
          </Text>
        }
        subtitle={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {item.desc ? item.desc.substring(0, 30) + (item.desc.length > 30 ? '...' : '') : ''}
            </Text>
          </View>
        }
        extra={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: '#666' }}>{timeAgoFormat(new Date(item.createdAt))}</Text>
          </View>
        }
        onPress={() => handleNotePress(item)}
        onLongPress={() => handleLongPress(item)}
      />
    ),
    [handleNotePress, handleLongPress],
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

      {/* 编辑笔记弹窗 */}
      <Modal
        visible={editModalVisible}
        title="编辑笔记"
        transparent
        onClose={closeEditModal}
        footer={[
          { text: '取消', onPress: closeEditModal },
          { text: '保存', onPress: handleSaveEdit },
        ]}
      >
        <View style={{ paddingVertical: 10 }}>
          <Text style={{ marginBottom: 8 }}>标题</Text>
          <Input
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="请输入笔记标题"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8 }}
          />
          <Text style={{ marginBottom: 8, marginTop: 12 }}>详情</Text>
          <Input
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="请输入笔记详情"
            multiline
            numberOfLines={4}
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 4, paddingHorizontal: 8, minHeight: 80 }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default NotePage;
