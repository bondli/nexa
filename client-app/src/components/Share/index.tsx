import { useState, useContext } from 'react';
import { View, Text } from 'react-native';
import { Button, Toast } from '@ant-design/react-native';

import { MainContext } from '@commons/context';
import ArticleService from '@services/ArticleService';

import styles from './styles';

interface SharePageProps {
  navigationParams: { title?: string; url?: string };
  onClose: () => void;
}

const Share: React.FC<SharePageProps> = ({ navigationParams, onClose }) => {
  const { title, url } = navigationParams;
  const { userInfo } = useContext(MainContext);
  const [saving, setSaving] = useState(false);

  // 处理保存按钮点击
  const handleSave = async () => {
    if (!url) {
      Toast.fail('URL 不能为空');
      return;
    }

    if (!userInfo?.id) {
      Toast.fail('请先登录');
      return;
    }

    setSaving(true);
    try {
      await ArticleService.shareToTempArticle(title || '', url, userInfo.id);
      Toast.success('保存成功');
      onClose();
    } catch (error) {
      console.error('保存临时文章失败:', error);
      Toast.fail('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>分享文章</Text>
      </View>

      <View style={styles.content}>
        {title ? (
          <View style={styles.infoItem}>
            <Text style={styles.label}>标题</Text>
            <Text style={styles.value} numberOfLines={2}>{title}</Text>
          </View>
        ) : null}

        <View style={styles.infoItem}>
          <Text style={styles.label}>链接</Text>
          <Text style={styles.url} numberOfLines={3}>
            {url}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          type="primary"
          loading={saving}
          onPress={handleSave}
          style={styles.saveButton}
        >
          保存到临时文章
        </Button>
        <Button
          onPress={onClose}
          style={styles.cancelButton}
        >
          取消
        </Button>
      </View>
    </View>
  );
};



export default Share;