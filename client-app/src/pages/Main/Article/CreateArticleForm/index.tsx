import { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { Button, Toast } from '@ant-design/react-native';

import ArticleService from '@services/ArticleService';

import styles from './styles';

interface CreateArticleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateArticleForm = ({ onSuccess, onCancel }: CreateArticleFormProps) => {
  const [url, setUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 提交表单
  const handleSubmit = async () => {
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
      onSuccess?.();
    } catch (error) {
      Toast.fail('文章添加失败');
      console.error('Error creating article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formItem}>
        <Text style={styles.label}>文章链接 *</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="请输入文章链接"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      <View style={styles.formItem}>
        <Text style={styles.label}>文章标题 *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="请输入文章标题"
          placeholderTextColor="#999"
        />
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

export default CreateArticleForm;