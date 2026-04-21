import React, { memo, useContext, useState } from 'react';
import { Card, Empty, Button, Popconfirm, Input, Modal, App } from 'antd';
import { PlusOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { KnowledgeContext } from './context';
import style from './index.module.less';

const KnowBase: React.FC = () => {
  const { message } = App.useApp();
  const { knowledgeList, currentKnowledge, setCurrentKnowledge, createKnowledge, deleteKnowledge, getKnowledgeList } =
    useContext(KnowledgeContext);

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
        // 选中刚刚创建的知识库
        setCurrentKnowledge(response.data);
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

  // 删除知识库
  const handleDeleteKnowledge = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const response = await deleteKnowledge(id);
      if (response.code === 0) {
        message.success('知识库删除成功');
        // 重新获取列表
        await getKnowledgeList();
        // 优先选中被删除的前一个知识库，如果前一个知识库不存在则选中后一个，如果完全没有知识库了，不选中任何知识库
        if (currentKnowledge?.id === id) {
          const currentIndex = knowledgeList.findIndex((item) => item.id === id);
          if (currentIndex > 0) {
            setCurrentKnowledge(knowledgeList[currentIndex - 1]);
          } else if (knowledgeList.length > 1) {
            setCurrentKnowledge(knowledgeList[1]);
          } else {
            setCurrentKnowledge(null);
          }
        }
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 点击知识库
  const handleSelectKnowledge = (knowledge: any) => {
    setCurrentKnowledge(knowledge);
  };

  return (
    <div className={style.knowbaseList}>
      <div className={style.knowbaseTitle}>
        <span>
          知识库<em className={style.titleTips}>[{knowledgeList?.length || 0}/20]</em>
        </span>
        <Button type={`text`} size={`small`} icon={<PlusOutlined />} onClick={() => setShowNewModal(true)} />
      </div>
      {!knowledgeList ||
        (knowledgeList.length === 0 && (
          <div className={style.knowbaseEmpty}>
            <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ))}
      {knowledgeList.map((item) => (
        <Card
          key={item.id}
          className={`${style.knowbaseCard} ${currentKnowledge?.id === item.id ? style.knowbaseCardActive : ''}`}
          hoverable
          onClick={() => handleSelectKnowledge(item)}
          styles={{ body: { padding: '12px' } }}
        >
          <div className={style.knowbaseCardContent}>
            <div className={style.knowbaseCardHeader}>
              <FolderOutlined className={style.knowbaseCardIcon} />
              <div className={style.knowbaseCardTitle}>{item.name}</div>
              <Popconfirm
                title="确认删除"
                description={`确定要删除知识库「${item.name}」吗？`}
                onConfirm={(e) => {
                  e?.stopPropagation();
                  handleDeleteKnowledge(e as any, item.id as number);
                }}
                onCancel={(e) => e?.stopPropagation()}
                okText="确认"
                cancelText="取消"
              >
                <DeleteOutlined
                  className={style.knowbaseCardDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                />
              </Popconfirm>
            </div>
            {item.description && <div className={style.knowbaseCardDesc}>{item.description}</div>}
            <div className={style.knowbaseCardFooter}>
              <span className={style.knowbaseCardCount}>{item.counts} 个文档</span>
            </div>
          </div>
        </Card>
      ))}

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

export default memo(KnowBase);
