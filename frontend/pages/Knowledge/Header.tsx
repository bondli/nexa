import React, { memo, useContext, useState } from 'react';
import { Button, Popover, Space, Input, Upload, Modal, App } from 'antd';
import type { UploadProps } from 'antd';
import { EllipsisOutlined, InboxOutlined, FormOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '@commons/request';
import { API_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import { KnowledgeContext } from './context';
import style from './index.module.less';

const Header: React.FC = () => {
  const { message, modal } = App.useApp();
  const { userInfo } = useContext(MainContext);
  const { currentKnowledge, updateKnowledge, deleteKnowledge, getKnowledgeList, getDocumentList } =
    useContext(KnowledgeContext);

  const [showActionModal, setShowActionModal] = useState(false);

  // 编辑知识库弹窗
  const [showEditModal, setShowEditModal] = useState(false);
  const [editKnowledgeName, setEditKnowledgeName] = useState('');
  const [editKnowledgeDesc, setEditKnowledgeDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  // 更新知识库
  const handleUpdateKnowledge = async () => {
    if (!editKnowledgeName || editKnowledgeName.trim() === '') {
      message.error('请输入知识库名称');
      return;
    }

    setSaving(true);
    try {
      const response = await updateKnowledge(currentKnowledge.id, editKnowledgeName.trim(), editKnowledgeDesc.trim());
      if (response.code === 0) {
        message.success('知识库更新成功');
        setShowEditModal(false);
        setEditKnowledgeName('');
        setEditKnowledgeDesc('');
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleMenuOpenChange = (open: boolean) => {
    setShowActionModal(open);
  };

  // 刷新知识库文档列表
  const handleRefresh = () => {
    getKnowledgeList();
  };

  // 编辑知识库
  const handleEdit = () => {
    setShowActionModal(false);
    setShowEditModal(true);
    setEditKnowledgeName(currentKnowledge?.name || '');
    setEditKnowledgeDesc(currentKnowledge?.description || '');
  };

  // 删除知识库
  const handleDelete = () => {
    setShowActionModal(false);
    modal.confirm({
      title: '确认删除吗？',
      content: '删除后将无法恢复，该知识库下的文档全部清空',
      onOk: async () => {
        try {
          const response = await deleteKnowledge(currentKnowledge?.id);
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
      },
    });
  };

  // 操作知识库菜单
  const actionMenu = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Button icon={<FormOutlined />} type={`text`} onClick={handleEdit}>
          编辑
        </Button>
        <Button icon={<DeleteOutlined />} type={`text`} onClick={handleDelete}>
          删除
        </Button>
        <Button icon={<ReloadOutlined />} type={`text`} onClick={handleRefresh}>
          刷新
        </Button>
      </div>
    );
  };

  // 上传配置
  const uploadConfig: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.md,.txt',
    action: `${API_BASE_URL}docs/upload`,
    headers: {
      'X-User-Id': `${userInfo?.id || ''}`,
      'X-From': 'Nexa-App-Client',
    },
    data: {
      knowledgeId: currentKnowledge?.id,
    },
    showUploadList: false,
    beforeUpload: (file) => {
      // 验证文件类型
      const isMdOrTxt = file.name.endsWith('.md') || file.name.endsWith('.txt');
      if (!isMdOrTxt) {
        message.error('只能上传 .md 或 .txt 文件');
        return false;
      }
      // 验证文件大小 (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('文件大小不能超过 5MB');
        return false;
      }
      setUploading(true);
      return true;
    },
    onChange: async (info) => {
      const { status } = info.file;
      if (status === 'done') {
        setUploading(false);
        const response = info.file.response;
        if (response.code === 0) {
          // 调用创建文档接口，关联知识库
          try {
            await request.post('/docs/create', {
              name: response.data.name,
              size: response.data.size,
              type: response.data.type,
              path: response.data.path,
              knowledgeId: currentKnowledge?.id,
            });
            message.success('文档上传成功');
            // 刷新文档列表
            if (currentKnowledge) {
              getDocumentList(currentKnowledge.id as number);
              // 同步刷新下左侧知识库列表，确保知识库的文档数被刷新
              getKnowledgeList();
            }
          } catch (error) {
            message.error('文档创建失败');
            console.error(error);
          }
        } else {
          message.error(response.message || '上传失败');
        }
      } else if (status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  if (!currentKnowledge) return null;

  return (
    <div className={style.knowHeader}>
      <div className={style.title}>
        <span className={style.titleText}>{currentKnowledge?.name || '知识库'}</span>
        <Popover
          content={actionMenu}
          trigger={`click`}
          open={showActionModal}
          onOpenChange={handleMenuOpenChange}
          placement={`bottom`}
        >
          <Button icon={<EllipsisOutlined />} type={`text`}></Button>
        </Popover>
      </div>
      <Space>
        <Upload {...uploadConfig}>
          <Button type="primary" loading={uploading} icon={<InboxOutlined />} size="small">
            上传文档
          </Button>
        </Upload>
      </Space>

      <Modal
        title="编辑知识库"
        open={showEditModal}
        onOk={handleUpdateKnowledge}
        onCancel={() => {
          setShowEditModal(false);
          setEditKnowledgeName('');
          setEditKnowledgeDesc('');
        }}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '8px' }}>
              名称 <span style={{ color: '#ff4d4f' }}>*</span>
            </div>
            <Input
              placeholder="请输入知识库名称"
              defaultValue={editKnowledgeName}
              onChange={(e) => setEditKnowledgeName(e.target.value)}
              onPressEnter={handleUpdateKnowledge}
            />
          </div>
          <div>
            <div style={{ marginBottom: '8px' }}>描述</div>
            <Input.TextArea
              placeholder="请输入知识库描述（可选）"
              defaultValue={editKnowledgeDesc}
              onChange={(e) => setEditKnowledgeDesc(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default memo(Header);
