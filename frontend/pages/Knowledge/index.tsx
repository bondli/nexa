import React, { memo, useState, useEffect, useContext } from 'react';
import { Button, Drawer, Upload, Table, Radio, App, Tag } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import { formatFileSize } from '@commons/utils';
import request from '@commons/request';
import style from './index.module.less';
import { userLog } from '@/commons/electron';

const { Dragger } = Upload;

interface DataType {
  id: number;
  name: string;
  desc: string;
  status: string;
  size?: number; // 文件大小（字节）
  type?: string;
  path?: string; // 文件路径
  createdAt: string;
}

const Knowledge: React.FC = () => {
  const { message, modal } = App.useApp();
  const { userInfo } = useContext(MainContext);

  const [showPanel, setShowPanel] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<DataType[]>([]);
  // 当前展示的面板
  const [currentPanel, setCurrentPanel] = useState('list');

  const togglePanel = () => {
    setShowPanel(!showPanel);
  };

  useEffect(() => {
    if (showPanel && currentPanel === 'list') {
      getNoteList();
    }
  }, [showPanel, currentPanel]);

  // 查询文档列表
  const getNoteList = async () => {
    try {
      const response = await request.get('/docs/getList');

      setInitLoading(false);
      setList(response.data || []);
    } catch (error) {
      message.error('查询文档列表失败');
      console.warn(error);
    }
  };

  // 下载文件 - 使用 responseType blob 不经过拦截器处理
  const handleDownload = async (record: DataType) => {
    try {
      // 直接用 axios 来下载文件，避免拦截器处理
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
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', record.name);
      document.body.appendChild(link);
      link.click();

      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('文件下载成功');
    } catch (error) {
      message.error('文件下载失败');
      console.warn(error);
    }
  };

  // 删除文档
  const handleDelete = async (record: DataType) => {
    modal.confirm({
      title: '确认删除',
      content: `确认要删除文档「${record.name}」吗？删除后无法恢复。`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await request.post(`/docs/delete?id=${record.id}`);
          if (response.code === 0) {
            message.success('文档删除成功');
            // 刷新列表
            await getNoteList();
          } else {
            message.error(response.message || '文档删除失败');
          }
        } catch (error) {
          message.error('文档删除失败');
          console.warn(error);
        }
      },
    });
  };

  const uploadConfig: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.md,.txt',
    action: `${API_BASE_URL}docs/upload`,
    headers: {
      'X-User-Id': `${userInfo?.id || ''}`,
      'X-From': 'Chat-App-Client',
    },
    onChange(info) {
      const { status, response } = info.file;
      if (status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        if (response.code === 0) {
          modal.success({
            title: '温馨提示',
            content: '文档上传成功',
            onOk: () => {
              setCurrentPanel('list');
            },
          });
        } else {
          message.error(response.message);
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files:', e.dataTransfer.files);
    },
  };

  // 处理面板切换
  const handleSwitchPanel = (e) => {
    userLog('Change panel: ', e.target.value);
    setCurrentPanel(e.target.value);
  };

  return (
    <>
      <Button type="link" size="small" onClick={togglePanel}>
        Knowledge
      </Button>
      <Drawer
        title="知识库"
        width={600}
        open={showPanel}
        onClose={() => setShowPanel(false)}
        destroyOnHidden={true}
        extra={
          <div>
            <Radio.Group defaultValue={'list'} buttonStyle={'solid'} onChange={handleSwitchPanel} value={currentPanel}>
              <Radio.Button value={'list'}>文档列表</Radio.Button>
              <Radio.Button value={'create'}>新增文档</Radio.Button>
            </Radio.Group>
          </div>
        }
      >
        {currentPanel === 'list' ? (
          <Table
            rowKey="id"
            size="small"
            columns={[
              {
                title: '文档名称',
                dataIndex: 'name',
              },
              {
                title: '大小',
                dataIndex: 'size',
                render: (text, record) => <div>{formatFileSize(record.size || 0)}</div>,
              },
              {
                title: '状态',
                dataIndex: 'status',
                render: (text, record) => (
                  <Tag color={record.status === 'normal' ? 'green' : 'red'}>{record.status}</Tag>
                ),
              },
              {
                title: '操作',
                align: 'center',
                render: (text, record) => (
                  <div>
                    <Button type="link" onClick={() => handleDownload(record)}>
                      查看
                    </Button>
                    <Button type="link" onClick={() => handleDelete(record)}>
                      删除
                    </Button>
                  </div>
                ),
              },
            ]}
            dataSource={list}
            pagination={false}
          />
        ) : (
          <div style={{ height: '180px', marginBottom: '40px' }}>
            <Dragger {...uploadConfig}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">{`Click or drag file to this area to upload`}</p>
              <p className="ant-upload-hint">{`Support for a single markdown/txt file upload.`}</p>
            </Dragger>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default memo(Knowledge);
