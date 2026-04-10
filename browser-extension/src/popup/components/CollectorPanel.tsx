import { useState, useEffect } from 'react';
import { Button, Select, message } from 'antd';
import { ScissorOutlined, SaveOutlined } from '@ant-design/icons';
import { extractPageContent } from '../../services/contentExtractor';
import { getCategories, saveNote, NoteData } from '../../services/note';
import styles from './CollectorPanel.module.less';

interface Category {
  id: number;
  name: string;
}

interface CollectorPanelProps {
  collectedContent: string;
  pageTitle: string;
  pageUrl: string;
  onContentExtracted: (content: string, title: string, url: string) => void;
  onSaveSuccess: () => void;
}

const CollectorPanel = ({
  collectedContent,
  pageTitle,
  pageUrl,
  onContentExtracted,
  onSaveSuccess,
}: CollectorPanelProps) => {
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [content, setContent] = useState(collectedContent);

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      const list = await getCategories();
      setCategories(list);
    };
    loadCategories();
  }, []);

  // 更新内容
  useEffect(() => {
    setContent(collectedContent);
  }, [collectedContent]);

  // 一键提取
  const handleExtract = async () => {
    setExtracting(true);
    try {
      const result = await extractPageContent();
      if (result.success) {
        onContentExtracted(result.content || '', result.title || '', result.url || '');
        message.success('提取成功');
      } else {
        message.error(result.message || '提取失败');
      }
    } catch {
      message.error('提取失败，请稍后重试');
    } finally {
      setExtracting(false);
    }
  };

  // 保存到笔记
  const handleSave = async () => {
    if (!selectedCategory) {
      message.warning('请选择笔记分类');
      return;
    }
    if (!content.trim()) {
      message.warning('内容不能为空');
      return;
    }

    setSaving(true);
    try {
      const noteData: NoteData = {
        title: pageTitle || '未命名',
        content,
        url: pageUrl,
        cateId: selectedCategory,
      };

      const result = await saveNote(noteData);

      if (result.success) {
        onSaveSuccess();
      } else {
        message.error(result.message || '保存失败');
      }
    } catch {
      message.error('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const hasContent = !!content;

  return (
    <div className={styles.container}>
      {/* 顶部：提取按钮 */}
      <div className={styles.extractSection}>
        <Button
          type="primary"
          icon={<ScissorOutlined />}
          onClick={handleExtract}
          loading={extracting}
          block
          size="large"
        >
          {extracting ? '提取中...' : '一键提取'}
        </Button>
      </div>

      {/* 内容区域：Markdown 编辑器 */}
      {hasContent && (
        <div className={styles.editorSection}>
          <textarea
            className={styles.editor}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="提取的内容将显示在这里，您可以编辑..."
            rows={12}
          />
        </div>
      )}

      {/* 底部：分类选择和保存按钮 */}
      {hasContent && (
        <div className={styles.actionSection}>
          <Select
            className={styles.categorySelect}
            placeholder="选择笔记分类"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categories.map((cate) => ({
              value: cate.id,
              label: cate.name,
            }))}
            allowClear
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            disabled={!selectedCategory}
            block
          >
            保存到笔记
          </Button>
        </div>
      )}
    </div>
  );
};

export default CollectorPanel;