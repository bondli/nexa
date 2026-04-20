import React, { memo, useContext } from 'react';
import { Card, Button, Tag, Empty, App, Popconfirm, Row, Col } from 'antd';
import { DownloadOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { format as timeAgoFormat } from 'timeago.js';
import { API_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import request from '@commons/request';
import { formatFileSize } from '@commons/utils';
import { KnowledgeContext } from './context';
import style from './index.module.less';

interface DataType {
  id: number;
  name: string;
  desc: string;
  status: string;
  size?: number;
  type?: string;
  path?: string;
  cloudUrl?: string | null;
  createdAt: string;
}

const Documents: React.FC = () => {
  const { message } = App.useApp();
  const { userInfo } = useContext(MainContext);
  const { currentKnowledge, documentList, getDocumentList, setSelectedDocument } = useContext(KnowledgeContext);

  // 下载文件
  const handleDownload = async (record: DataType) => {
    try {
      const response = await fetch(`${API_BASE_URL}docs/download?id=${record.id}`, {
        method: 'GET',
        headers: {
          'X-User-Id': String(userInfo.id || 0),
          'X-From': 'Nexa-App-Client',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.name;
      document.body.appendChild(link);
      link.click();

      // 清理
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      message.success('文件下载成功');
    } catch (error) {
      message.error((error as Error).message || '文件下载失败');
      console.error('文件下载错误:', error);
    }
  };

  // 删除文档
  const handleDelete = async (record: DataType) => {
    try {
      const response = await request.post(`/docs/delete?id=${record.id}`);
      if (response.code === 0) {
        message.success('文档删除成功');
        // 刷新列表
        if (currentKnowledge) {
          getDocumentList(currentKnowledge.id as number);
        }
      } else {
        message.error(response.message || '文档删除失败');
      }
    } catch (error) {
      message.error('文档删除失败');
      console.warn(error);
    }
  };

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
      {documentList.length === 0 ? (
        <Empty description="暂无文档，请上传" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Row gutter={[16, 16]}>
          {documentList.map((doc: DataType) => (
            <Col key={doc.id} xs={24} sm={12} md={8} lg={8} xl={8}>
              <Card
                hoverable
                className={style.documentCard}
                onClick={() => setSelectedDocument(doc)}
                actions={[
                  <Button
                    key={0}
                    type="link"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(doc);
                    }}
                    icon={<DownloadOutlined />}
                  >
                    下载
                  </Button>,
                  <Popconfirm
                    key={1}
                    title="确认删除"
                    description={`确定要删除文档「${doc.name}」吗？`}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      handleDelete(doc);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <div className={style.documentCardContent}>
                  <div className={style.documentCardHeader}>
                    <FileTextOutlined className={style.documentCardIcon} />
                    <div className={style.documentCardTitle} title={doc.name}>
                      {doc.name}
                    </div>
                  </div>
                  <div className={style.documentCardMeta}>
                    <div className={style.documentCardInfo}>
                      <span>大小: {formatFileSize(doc.size || 0)}</span>
                    </div>
                    <div className={style.documentCardInfo}>
                      <span>状态: </span>
                      <Tag color={doc.status === 'normal' ? 'green' : 'red'}>
                        {doc.status === 'normal' ? '正常' : '异常'}
                      </Tag>
                    </div>
                    <div className={style.documentCardInfo}>
                      <span>上传: {timeAgoFormat(doc.createdAt, 'zh_CN')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default memo(Documents);
