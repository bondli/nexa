import React, { memo, useContext, useState } from 'react';
import { Table, Button, Tag, Empty, Upload, App, Popconfirm } from 'antd';
import { DownloadOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { format as timeAgoFormat } from 'timeago.js';
import { API_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import { formatFileSize } from '@commons/utils';
import request from '@commons/request';
import { KnowledgeContext } from './context';
import style from './index.module.less';

const { Dragger } = Upload;

interface DataType {
  id: number;
  name: string;
  desc: string;
  status: string;
  size?: number;
  type?: string;
  path?: string;
  createdAt: string;
}

const Documents: React.FC = () => {
  const { message: antdMessage, modal } = App.useApp();
  const { userInfo } = useContext(MainContext);
  const { currentKnowledge, documentList, setSelectedDocument, getDocumentList } = useContext(KnowledgeContext);

  const [uploading, setUploading] = useState(false);

  // 下载文件
  const handleDownload = async (record: DataType) => {
    try {
      const loginData = JSON.parse(localStorage.getItem('loginData') || '{}');
      const response = await fetch(`${API_BASE_URL}/docs/download?id=${record.id}`, {
        headers: {
          'X-User-Id': loginData.id || 0,
          'X-From': 'Nexa-App-Client',
        },
      });

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      antdMessage.success('文件下载成功');
    } catch (error) {
      antdMessage.error('文件下载失败');
      console.warn(error);
    }
  };

  // 删除文档
  const handleDelete = async (record: DataType) => {
    try {
      const response = await request.post(`/docs/delete?id=${record.id}`);
      if (response.code === 0) {
        antdMessage.success('文档删除成功');
        // 刷新列表
        if (currentKnowledge) {
          getDocumentList(currentKnowledge.id as number);
        }
      } else {
        antdMessage.error(response.message || '文档删除失败');
      }
    } catch (error) {
      antdMessage.error('文档删除失败');
      console.warn(error);
    }
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
        antdMessage.error('只能上传 .md 或 .txt 文件');
        return false;
      }
      // 验证文件大小 (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        antdMessage.error('文件大小不能超过 5MB');
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
            antdMessage.success('文档上传成功');
            // 刷新文档列表
            if (currentKnowledge) {
              getDocumentList(currentKnowledge.id as number);
            }
          } catch (error) {
            antdMessage.error('文档创建失败');
          }
        } else {
          antdMessage.error(response.message || '上传失败');
        }
      } else if (status === 'error') {
        setUploading(false);
        antdMessage.error(`${info.file.name} 上传失败`);
      }
    },
  };

  // 表格列定义
  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (_: any, record: DataType) => formatFileSize(record.size || 0),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'normal' ? 'green' : 'red'}>{status === 'normal' ? '正常' : '异常'}</Tag>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (text: string) => timeAgoFormat(text, 'zh_CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: DataType) => (
        <div>
          <Button type="link" size="small" onClick={() => handleDownload(record)} icon={<DownloadOutlined />}>
            下载
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除文档「${record.name}」吗？`}
            onConfirm={() => handleDelete(record)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // 没有选择知识库
  if (!currentKnowledge) {
    return (
      <div className={style.documentsContainer}>
        <Empty description="请先选择一个知识库" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className={style.documentsContainer}>
      <div className={style.documentsHeader}>
        <span className={style.documentsTitle}>{currentKnowledge.name} - 文档列表</span>
        <Upload {...uploadConfig}>
          <Button type="primary" loading={uploading} icon={<InboxOutlined />}>
            上传文档
          </Button>
        </Upload>
      </div>
      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={documentList}
        pagination={false}
        locale={{
          emptyText: <Empty description="暂无文档，请上传" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        }}
      />
    </div>
  );
};

export default memo(Documents);
