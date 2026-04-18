import { useEffect, useState, useContext } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';

import { Toast, List, Input, Button, Picker } from '@ant-design/react-native';

import ArticleService from '@services/ArticleService';
import NoteService from '@services/NoteService';

import { MainContext } from '@/commons/context';

import ButtonGroup from '@/components/ButtonGroup';

import styles from './styles';

const options = [
  { label: '收集文章', value: 'write-article' },
  { label: '收集笔记', value: 'write-note' },
];

const CollectPage = () => {
  const { setCurrentPage } = useContext(MainContext);
  const [collectType, setCollectType] = useState<string>('write-article');
  const [loading, setLoading] = useState<boolean>(false);

  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteDesc, setNoteDesc] = useState<string>('');
  const [cateId, setCateId] = useState<number[]>([]);
  const [categories, setCategories] = useState<Array<{ label: string; value: number }>>([]);

  // 选中采集类型
  const handleTypeChange = (value: string) => {
    setCollectType(value);
  };

  // 加载笔记分类
  const loadCategories = async () => {
    try {
      const result = await NoteService.getCategories();
      setCategories(result);
    } catch (error) {
      console.error('Error loading categories:', error);
      Toast.fail('获取分类失败');
    }
  };
  
  // 提交表单(文章)
  const handleSubmitArticle = async () => {
    // 验证 URL
    if (!url.trim()) {
      Toast.fail('请输入文章链接');
      return;
    }

    // 验证标题
    if (!title.trim()) {
      Toast.fail('请输入文章标题');
      return;
    }

    try {
      setLoading(true);
      // 使用固定的 userId = 1，实际应该从登录状态获取
      await ArticleService.shareToTempArticle(title.trim(), url.trim(), 1);
      Toast.success('文章添加成功');
      // 清空表单
      setUrl('');
      setTitle('');
      setCurrentPage('Article');
    } catch (error) {
      Toast.fail('文章添加失败');
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提交表单(笔记)
  const handleSubmitNote = async () => {
    // 验证标题
    if (!noteTitle.trim()) {
      Toast.fail('请输入笔记标题');
      return;
    }

    // 验证分类
    if (!cateId.length) {
      Toast.fail('请选择笔记分类');
      return;
    }

    try {
      setLoading(true);
      await NoteService.createNote(noteTitle.trim(), noteDesc.trim(), cateId[0]);
      Toast.success('笔记创建成功');
      // 清空表单
      setNoteTitle('');
      setNoteDesc('');
      setCateId([]);
      setCurrentPage('Note');
    } catch (error) {
      Toast.fail('笔记创建失败');
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // todo something
    console.log('Collect Page inited');
  }, []);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.searchContainer}>
          <ButtonGroup options={options} onChange={handleTypeChange} />
        </View>

        {
          collectType === 'write-article' ? (
            <View style={styles.formContainer}>
              <List renderHeader="采集文章">
                <List.Item>
                  <Input.TextArea
                    placeholder="请输入文章链接"
                    allowClear
                    value={url}
                    onChangeText={setUrl}
                    rows={4}
                  />
                </List.Item>
                <List.Item>
                  <Input
                    prefix="文章标题"
                    placeholder="请输入文章标题"
                    allowClear
                    value={title}
                    onChangeText={setTitle}
                  />
                </List.Item>
              </List>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <List renderHeader="采集笔记">
                <List.Item>
                  <Input
                    prefix="笔记标题"
                    placeholder="请输入笔记标题"
                    allowClear
                    value={noteTitle}
                    onChangeText={setNoteTitle}
                  />
                </List.Item>
                <List.Item>
                  <Input.TextArea
                    placeholder="请输入笔记详情"
                    allowClear
                    value={noteDesc}
                    onChangeText={setNoteDesc}
                    rows={4}
                  />
                </List.Item>
                <Picker
                  data={categories}
                  cols={1}
                  value={cateId}
                  onChange={(val) => setCateId(val as number[])}
                  onVisibleChange={(visible) => { if (visible) loadCategories(); }}
                >
                  <List.Item arrow="horizontal">
                    {cateId.length
                      ? categories.find(c => c.value === cateId[0])?.label ?? '请选择分类'
                      : '请选择分类'}
                  </List.Item>
                </Picker>
              </List>
            </View>
          )
        }
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          type="primary"
          loading={loading}
          onPress={collectType === 'write-article' ? handleSubmitArticle : handleSubmitNote}
        >
          {loading ? '提交中...' : '提交'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );

};

export default CollectPage;
