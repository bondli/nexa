import { useState, useEffect } from 'react';
import { View, Text, TextInput } from 'react-native';
import { ActionSheet, Button, Toast } from '@ant-design/react-native';

import NoteService from '@services/NoteService';

import styles from './styles';

interface CreateNoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateNoteForm = ({ onSuccess, onCancel }: CreateNoteFormProps) => {
  const [title, setTitle] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [cateId, setCateId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Array<{ label: string; value: number }>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await NoteService.getCategories();
        setCategories(result);
        if (result.length > 0) {
          setCateId(result[0].value);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // 提交表单
  const handleSubmit = async () => {
    // 验证标题
    if (!title.trim()) {
      Toast.fail('请输入标题');
      return;
    }

    // 验证分类
    if (!cateId) {
      Toast.fail('请选择分类');
      return;
    }

    try {
      setLoading(true);
      await NoteService.createNote(title.trim(), desc.trim(), cateId);
      Toast.success('笔记创建成功');
      // 清空表单
      setTitle('');
      setDesc('');
      onSuccess?.();
    } catch (error) {
      Toast.fail('笔记创建失败');
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  // 显示分类选择
  const handleShowCategoryPicker = () => {
    const options = categories.map((item) => item.label);
    options.push('取消');

    ActionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: '选择分类',
      },
      (buttonIndex) => {
        if (buttonIndex < categories.length) {
          setCateId(categories[buttonIndex].value);
        }
      }
    );
  };

  // 获取当前选中的分类名称
  const getSelectedCategoryName = () => {
    const selected = categories.find((item) => item.value === cateId);
    return selected?.label || '请选择分类';
  };

  return (
    <View style={styles.container}>
      <View style={styles.formItem}>
        <Text style={styles.label}>标题 *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="请输入笔记标题"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>描述</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={desc}
          onChangeText={setDesc}
          placeholder="请输入笔记描述"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>分类 *</Text>
        <Button onPress={handleShowCategoryPicker} style={styles.categoryButton}>
          {getSelectedCategoryName()}
        </Button>
      </View>

      <Button
        type="primary"
        loading={loading}
        onPress={handleSubmit}
        style={styles.submitButton}
      >
        {loading ? '提交中...' : '提交'}
      </Button>
    </View>
  );
};

export default CreateNoteForm;