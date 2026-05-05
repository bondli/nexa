import React, { useState } from 'react';
import { Modal, Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import request from '@commons/request';
import styles from './index.module.less';

interface AddSkillModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<{ name: string; content: string }[]>([]);
  const [skillMdContent, setSkillMdContent] = useState<string>('');

  // 处理文件上传 - 读取文件内容
  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setFileList((prev) => [...prev, { name: file.name, content }]);

        // 如果是 skill.md，记录内容用于解析
        if (file.name === 'skill.md') {
          setSkillMdContent(content);
          // 自动解析
          parseSkillMd(content);
        }

        message.success(`已上传: ${file.name}`);
      } catch (error) {
        message.error(`读取文件失败: ${file.name}`);
        console.error(`读取文件失败: ${file.name}`, error);
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 解析 skill.md 内容
  const parseSkillMd = (content: string) => {
    const lines = content.split('\n');
    let name = '';
    let description = '';
    let version = '1.0.0';
    let author = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        name = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('name:')) {
        name = trimmed.substring(5).trim();
      } else if (trimmed.startsWith('description:')) {
        description = trimmed.substring(12).trim();
      } else if (trimmed.startsWith('version:')) {
        version = trimmed.substring(8).trim();
      } else if (trimmed.startsWith('author:')) {
        author = trimmed.substring(7).trim();
      }
    }

    if (name) {
      form.setFieldsValue({ name, description, version, author });
    }
  };

  // 移除文件
  const handleRemoveFile = (fileName: string) => {
    setFileList((prev) => prev.filter((f) => f.name !== fileName));
    if (fileName === 'skill.md') {
      setSkillMdContent('');
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建 files 对象
      const files: Record<string, string> = {};
      for (const file of fileList) {
        files[file.name] = file.content;
      }

      const payload = {
        ...values,
        skillMdContent,
        files,
      };

      await request.post('/skill/install', payload);
      message.success('Skill 安装成功');
      form.resetFields();
      setFileList([]);
      setSkillMdContent('');
      onSuccess();
    } catch (error) {
      console.error('[AddSkillModal] 安装 Skill 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 关闭时重置表单
  const handleClose = () => {
    form.resetFields();
    setFileList([]);
    setSkillMdContent('');
    onClose();
  };

  return (
    <Modal
      title="添加新 Skill"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          安装
        </Button>,
      ]}
      width={560}
    >
      <div className={styles.addForm}>
        <Form form={form} layout="horizontal" labelCol={{ span: 4 }}>
          <Form.Item label="上传文件" extra="上传 skill.md 和相关脚本文件">
            <Upload beforeUpload={handleFileUpload} directory showUploadList={false}>
              <Button icon={<UploadOutlined />}>选择skill目录</Button>
            </Upload>
          </Form.Item>

          {fileList.length > 0 && (
            <div className={styles.fileList}>
              {fileList.map((file) => (
                <div key={file.name} className={styles.fileItem}>
                  <FileOutlined />
                  <span className={styles.fileName}>{file.name}</span>
                  <Button type="link" size="small" danger onClick={() => handleRemoveFile(file.name)}>
                    移除
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.addFormTitle} style={{ marginTop: 24 }}>
            Skill 信息
          </div>

          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入 Skill 名称' }]}>
            <Input placeholder="Skill 名称" />
          </Form.Item>

          <Form.Item name="description" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input.TextArea rows={3} placeholder="简要描述此 Skill 的功能" />
          </Form.Item>

          <Form.Item name="version" label="版本" initialValue="1.0.0">
            <Input placeholder="例如: 1.0.0" />
          </Form.Item>

          <Form.Item name="author" label="作者">
            <Input placeholder="可选" />
          </Form.Item>

          <Form.Item name="category" label="分类">
            <Input placeholder="可选，例如: 工具、搜索、生活" />
          </Form.Item>

          <Form.Item name="tags" label="标签">
            <Input placeholder="可选，多个标签用逗号分隔" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddSkillModal;
