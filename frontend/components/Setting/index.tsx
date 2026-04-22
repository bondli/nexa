import React, { memo, useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Collapse, App } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import request from '@commons/request';
import styles from './index.module.less';

interface ConfigForm {
  // 数据库配置
  DB_HOST?: string;
  DB_PORT?: number;
  DB_NAME?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  // LLM 配置
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  // Embedding 配置
  embeddingApiKey?: string;
  embeddingBaseUrl?: string;
  embeddingModel?: string;
  // Qdrant 配置
  qdrantUrl?: string;
  // 云端 API 配置
  cloudApikey?: string;
  endpoint?: string;
}

/**
 * 统一配置结构
 */
interface UnifiedConfig {
  database?: {
    DB_HOST?: string;
    DB_PORT?: number;
    DB_NAME?: string;
    DB_USERNAME?: string;
    DB_PASSWORD?: string;
  };
  llm?: {
    provider?: string;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
  embedding?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
  qdrant?: {
    url?: string;
  };
  cloudapi?: {
    apiKey?: string;
    endpoint?: string;
  };
}

/**
 * 获取设置
 */
const getSettings = async (): Promise<UnifiedConfig> => {
  const response = await request.get('/settings/get');
  return response.data || {};
};

/**
 * 保存设置
 */
const saveSettings = async (config: UnifiedConfig): Promise<void> => {
  await request.post('/settings/save', config);
};

const { Panel } = Collapse;

const Setting: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  // 打开抽屉时加载配置
  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  // 加载配置
  const loadConfig = async () => {
    try {
      const config: UnifiedConfig = await getSettings();
      const formData: ConfigForm = {
        // 数据库配置
        ...config.database,
        // LLM 配置
        ...config.llm,
        // Embedding 配置
        embeddingApiKey: config.embedding?.apiKey,
        embeddingBaseUrl: config.embedding?.baseUrl,
        embeddingModel: config.embedding?.model,
        // Qdrant 配置
        qdrantUrl: config.qdrant?.url,
        // 云端 API 配置
        cloudApikey: config.cloudapi?.apiKey,
        endpoint: config.cloudapi?.endpoint,
      };
      form.setFieldsValue(formData);
    } catch (error) {
      message.error('加载配置失败');
      console.error(error);
    }
  };

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const config: UnifiedConfig = {
        database: {
          DB_HOST: values.DB_HOST,
          DB_PORT: values.DB_PORT,
          DB_NAME: values.DB_NAME,
          DB_USERNAME: values.DB_USERNAME,
          DB_PASSWORD: values.DB_PASSWORD,
        },
        llm: {
          provider: values.provider,
          apiKey: values.apiKey,
          baseUrl: values.baseUrl,
          model: values.model,
          temperature: values.temperature,
          maxTokens: values.maxTokens,
        },
        embedding: {
          apiKey: values.embeddingApiKey,
          baseUrl: values.embeddingBaseUrl,
          model: values.embeddingModel,
        },
        qdrant: {
          url: values.qdrantUrl,
        },
        cloudapi: {
          apiKey: values.cloudApikey,
          endpoint: values.endpoint,
        },
      };

      await saveSettings(config);
      message.success('配置保存成功');
      setOpen(false);
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message || '保存配置失败');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <SettingOutlined style={{ fontSize: '16px', verticalAlign: 'middle' }} onClick={() => setOpen(true)} />
      <Drawer
        title="系统设置"
        placement="right"
        size={600}
        onClose={() => setOpen(false)}
        open={open}
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            保存
          </Button>
        }
      >
        <Form form={form} layout="vertical">
          <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>
            <Panel header="数据库配置" key="1">
              <Form.Item name="DB_HOST" label="数据库地址">
                <Input placeholder="请输入数据库地址" />
              </Form.Item>
              <Form.Item name="DB_PORT" label="端口">
                <Input type="number" placeholder="请输入端口" />
              </Form.Item>
              <Form.Item name="DB_NAME" label="数据库名称">
                <Input placeholder="请输入数据库名称" />
              </Form.Item>
              <Form.Item name="DB_USERNAME" label="用户名">
                <Input placeholder="请输入用户名" />
              </Form.Item>
              <Form.Item name="DB_PASSWORD" label="密码">
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </Panel>

            <Panel header="LLM 设置" key="2">
              <Form.Item name="provider" label="Provider">
                <Input placeholder="如: openai, anthropic 等" />
              </Form.Item>
              <Form.Item name="apiKey" label="API Key">
                <Input.Password placeholder="请输入 API Key" />
              </Form.Item>
              <Form.Item name="baseUrl" label="Base URL">
                <Input placeholder="请输入 Base URL" />
              </Form.Item>
              <Form.Item name="model" label="模型">
                <Input placeholder="请输入模型名称" />
              </Form.Item>
              <Form.Item name="temperature" label="Temperature">
                <Input type="number" step="0.1" min="0" max="2" placeholder="0-2" />
              </Form.Item>
              <Form.Item name="maxTokens" label="Max Tokens">
                <Input type="number" placeholder="请输入最大 token 数" />
              </Form.Item>
            </Panel>

            <Panel header="Embedding 设置" key="3">
              <Form.Item name="embeddingApiKey" label="API Key">
                <Input.Password placeholder="请输入 API Key" />
              </Form.Item>
              <Form.Item name="embeddingBaseUrl" label="Base URL">
                <Input placeholder="请输入 Base URL" />
              </Form.Item>
              <Form.Item name="embeddingModel" label="模型">
                <Input placeholder="请输入模型名称" />
              </Form.Item>
            </Panel>

            <Panel header="Qdrant 服务器设置" key="4">
              <Form.Item name="qdrantUrl" label="Qdrant URL">
                <Input placeholder="如: http://localhost:6333" />
              </Form.Item>
            </Panel>

            <Panel header="图片服务器设置" key="5">
              <Form.Item name="cloudApikey" label="API Key">
                <Input.Password placeholder="请输入 API Key" />
              </Form.Item>
              <Form.Item name="endpoint" label="Endpoint">
                <Input placeholder="请输入上传 Endpoint" />
              </Form.Item>
            </Panel>
          </Collapse>
        </Form>
      </Drawer>
    </div>
  );
};

export default memo(Setting);
