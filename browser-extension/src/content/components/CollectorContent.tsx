import React, { useState } from 'react';
import { Input, Button, Select, Typography, App as AntdApp } from 'antd';
import { ScissorOutlined, SaveOutlined, LogoutOutlined } from '@ant-design/icons';
import { UserInfo } from '../../services/utils';
import { getCategories, saveArticle, ArticleData, Category } from '../../services/article';
import { extractPageContent } from '../../services/contentExtractor';

const { TextArea } = Input;
const { Text } = Typography;

interface CollectorContentProps {
  user: UserInfo;
  onLogout: () => void;
  onClose: () => void;
}

const CollectorContent: React.FC<CollectorContentProps> = ({ user, onLogout, onClose }) => {
  const { message } = AntdApp.useApp();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasContent = content.trim().length > 0;

  const loadCategories = async () => {
    setCatLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      console.error('加载分类失败');
    } finally {
      setCatLoading(false);
    }
  };

  const handleExtract = () => {
    setExtracting(true);
    try {
      const result = extractPageContent();
      if (result.success) {
        setContent(result.content || '');
        setTitle(result.title || '未命名');
        setUrl(result.url || '');
        message.success('内容提取成功');
        loadCategories();
      } else {
        message.error(result.message || '提取失败，请稍后重试');
      }
    } catch {
      message.error('提取失败，请稍后重试');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedCategory || !content.trim()) return;

    setSaving(true);
    try {
      const noteData: ArticleData = {
        title: title || '未命名',
        desc: content,
        url,
        cateId: selectedCategory,
      };
      const result = await saveArticle(noteData);
      if (result.success) {
        message.success('保存成功');
        onClose();
      } else {
        message.error(result.message || '保存失败');
      }
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // Select 下拉层挂载到 body，通过 dropdownStyle 设置足够高的 z-index
  const selectDropdownStyle = { zIndex: 2147483647 };

  return (
    <div style={{ padding: '16px' }}>
      {/* 头部：欢迎信息 + 退出 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0',
      }}>
        <Text type="secondary" style={{ fontSize: '13px' }}>欢迎，{user.name}</Text>
        <Button
          type="text"
          size="small"
          icon={<LogoutOutlined />}
          onClick={onLogout}
          style={{ color: '#8c8c8c' }}
        >
          退出
        </Button>
      </div>

      {/* 一键提取按钮 */}
      <Button
        type="primary"
        icon={<ScissorOutlined />}
        onClick={handleExtract}
        loading={extracting}
        disabled={hasContent}
        block
        size="large"
        style={{ marginBottom: hasContent ? '16px' : 0 }}
      >
        {extracting ? '提取中...' : '一键提取'}
      </Button>

      {/* 提取结果区域 - 仅提取到内容后显示 */}
      {hasContent && (
        <>
          {/* Markdown 编辑器 */}
          <div style={{ marginBottom: '12px' }}>
            <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block', marginBottom: '6px' }}>
              内容（Markdown）
            </Text>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoSize={{ minRows: 6, maxRows: 20 }}
              style={{ fontSize: '13px', fontFamily: 'monospace', resize: 'none' }}
            />
          </div>

          {/* 分类选择 */}
          <div style={{ marginBottom: '12px' }}>
            <Text style={{ fontSize: '12px', color: '#8c8c8c', display: 'block', marginBottom: '6px' }}>
              文章分类
            </Text>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="请选择笔记分类"
              loading={catLoading}
              style={{ width: '100%' }}
              options={categories.map(c => ({ label: c.name, value: c.id }))}
              dropdownStyle={selectDropdownStyle}
            />
          </div>

          {/* 保存按钮 */}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!selectedCategory || !content.trim()}
            loading={saving}
            block
            size="large"
          >
            {saving ? '保存中...' : '保存到Nexa'}
          </Button>
        </>
      )}
    </div>
  );
};

export default CollectorContent;
