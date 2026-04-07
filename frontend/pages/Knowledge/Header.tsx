import React, { memo, useContext, useState } from 'react';
import { Button, Input, Modal, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { KnowledgeContext } from './context';
import style from './index.module.less';

const Header: React.FC = () => {
  const { message } = App.useApp();
  const { currentKnowledge, createKnowledge, getKnowledgeList } = useContext(KnowledgeContext);

  // 新建知识库弹窗
  const [showNewModal, setShowNewModal] = useState(false);
  const [newKnowledgeName, setNewKnowledgeName] = useState('');
  const [newKnowledgeDesc, setNewKnowledgeDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // 创建知识库
  const handleCreateKnowledge = async () => {
    if (!newKnowledgeName || newKnowledgeName.trim() === '') {
      message.error('请输入知识库名称');
      return;
    }

    setCreating(true);
    try {
      const response = await createKnowledge(newKnowledgeName.trim(), newKnowledgeDesc.trim());
      if (response.code === 0) {
        message.success('知识库创建成功');
        setShowNewModal(false);
        setNewKnowledgeName('');
        setNewKnowledgeDesc('');
        // 刷新列表
        await getKnowledgeList();
      } else {
        message.error(response.message || '创建失败');
      }
    } catch (error) {
      message.error('创建失败');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={style.headerContainer}>
      <div className={style.headerTitle}>{currentKnowledge ? currentKnowledge.name : '知识库'}</div>
      <div className={style.headerActions}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowNewModal(true)}>
          新建知识库
        </Button>
      </div>

      {/* 新建知识库弹窗 */}
      <Modal
        title="新建知识库"
        open={showNewModal}
        onOk={handleCreateKnowledge}
        onCancel={() => {
          setShowNewModal(false);
          setNewKnowledgeName('');
          setNewKnowledgeDesc('');
        }}
        confirmLoading={creating}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              名称 <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <Input
              placeholder="请输入知识库名称"
              value={newKnowledgeName}
              onChange={(e) => setNewKnowledgeName(e.target.value)}
              onPressEnter={handleCreateKnowledge}
            />
          </div>
          <div>
            <div style={{ marginBottom: '8px' }}>描述</div>
            <Input.TextArea
              placeholder="请输入知识库描述（可选）"
              value={newKnowledgeDesc}
              onChange={(e) => setNewKnowledgeDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default memo(Header);
