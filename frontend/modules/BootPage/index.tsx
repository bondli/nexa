import React, { memo, useContext } from 'react';
import type { FormProps } from 'antd';
import { Layout, Row, Col, Form, Input, Button, App } from 'antd';
import { userLog, setStore } from '@commons/electron';
import request from '@commons/request';
import { MainContext } from '@commons/context';
import Logo from '@components/Logo';
import style from './index.module.less';

const { Header, Content } = Layout;

type installFieldType = {
  dbhost?: string;
  dbport?: string;
  dbname?: string;
  dbuser?: string;
  dbpwd?: string;
};

const BootPage: React.FC = () => {
  const { message } = App.useApp();

  const { setAppInited } = useContext(MainContext);

  // 执行初始化
  const onRegister: FormProps<installFieldType>['onFinish'] = async (values) => {
    userLog('Submit appInstall data:', values);
    const result = await request.post('/system/saveConfig', {
      dbhost: values.dbhost,
      dbport: values.dbport,
      dbname: values.dbname,
      dbuser: values.dbuser,
      dbpwd: values.dbpwd,
    });
    userLog('Submit appInstall Result:', result);
    if (!result || !result?.success) {
      message.error(`安装失败：${result?.data?.error}`);
      return;
    }
    message.success(`安装成功，正在进入系统`);
    setStore('bootstrapData', {
      installed: true,
    });
    setAppInited(true);
  };

  return (
    <Layout className={style.layout}>
      <Header className={style.header}>
        <Logo mode={'light'} title={'NEXA'} />
        <div className={style.sologon}>{'AI Knowledage Manager'}</div>
      </Header>
      <Content className={style.content}>
        <Row
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Col span={24}>
            <div className={style.mainForm}>
              <Form
                name="basic"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                style={{ minWidth: 600, maxWidth: 800 }}
                onFinish={onRegister}
                autoComplete="off"
              >
                <Form.Item<installFieldType>
                  label={`数据库服务器`}
                  name="dbhost"
                  hasFeedback
                  rules={[{ required: true, message: '数据库服务器不能为空' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<installFieldType>
                  label={`数据库端口`}
                  name="dbport"
                  hasFeedback
                  rules={[{ required: true, message: '数据库端口不能为空' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<installFieldType>
                  label={`数据库名称`}
                  name="dbname"
                  hasFeedback
                  rules={[{ required: true, message: '数据库名称不能为空' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<installFieldType>
                  label={`用户名`}
                  name="dbuser"
                  hasFeedback
                  rules={[{ required: true, message: '用户名不能为空' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item<installFieldType>
                  label={`密码`}
                  name="dbpwd"
                  hasFeedback
                  rules={[{ required: true, message: '密码不能为空' }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
                  <Button type="primary" htmlType="submit">
                    提交初始化
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default memo(BootPage);
