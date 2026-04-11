import React, { useState } from 'react';
import { Input, Button, Typography, Form, App as AntdApp } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { UserInfo } from '../../services/utils';
import { login } from '../../services/auth';

const { Text, Title } = Typography;

interface LoginFormProps {
  onLoginSuccess: (user: UserInfo) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        message.error(result.message || '用户名或密码错误');
      }
    } catch {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <BookOutlined style={{ fontSize: '36px', color: '#1677ff' }} />
        <Title level={5} style={{ margin: '10px 0 4px', color: '#1a1a1a' }}>登录到 Nexa</Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>采集并保存网页内容</Text>
      </div>

      <Form form={form} onFinish={handleLogin} layout="vertical" size="large">
        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
          <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="用户名" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="密码" />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
