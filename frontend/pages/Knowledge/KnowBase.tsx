import React, { memo, useContext, useState, useEffect } from 'react';
import { Card, Empty, Button, Popconfirm, App } from 'antd';
import { PlusOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { KnowledgeContext } from './context';
import style from './index.module.less';

const KnowBase: React.FC = () => {
  const { message } = App.useApp();
  const { knowledgeList, currentKnowledge, setCurrentKnowledge, deleteKnowledge, getKnowledgeList } =
    useContext(KnowledgeContext);

  // 删除知识库
  const handleDeleteKnowledge = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const response = await deleteKnowledge(id);
      if (response.code === 0) {
        message.success('知识库删除成功');
        // 重新获取列表
        await getKnowledgeList();
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

  // 空状态
  if (!knowledgeList || knowledgeList.length === 0) {
    return (
      <div className={style.knowbaseEmpty}>
        <Empty description="暂无知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className={style.knowbaseList}>
      {knowledgeList.map((item) => (
        <Card
          key={item.id}
          className={`${style.knowbaseCard} ${currentKnowledge?.id === item.id ? style.knowbaseCardActive : ''}`}
          hoverable
          onClick={() => handleSelectKnowledge(item)}
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
    </div>
  );
};

export default memo(KnowBase);
