import React, { memo, useContext } from 'react';
import { App, Layout, Space } from 'antd';
import { generateUUID, sleep } from '@commons/utils';
import { AGENT_BASE_URL } from '@commons/constant';
import { MainContext } from '@commons/context';
import { ChatBoxContext, ChatBoxProvider } from './context';
import ChatHistory from './ChatHistory';
import MessageList from './MessageList';
import NewChatButton from './NewChatButton';
import ChatSender from './ChatSender';
import style from './index.module.less';

const { Header, Sider, Content } = Layout;

const ChatBoxPage: React.FC = () => {
  // const { message } = App.useApp();
  const { userInfo } = useContext(MainContext);

  const { currentChat, setMessageList, abortController, setMessageProcessing, conversationId, setConversationId } =
    useContext(ChatBoxContext);

  // 新会话
  const handleNewChat = () => {
    setConversationId(generateUUID());
  };

  // 提交消息到agent
  const submitMessage = async (msg: string, action?: string) => {
    setMessageProcessing(true);

    // 获取sessionId的顺序：当前选中的会话 --> 新生成的会话ID --> 临时分配一个
    let finalSessionId = currentChat?.sessionId || conversationId || '';
    // 首次进入可能没有conversationId，系统给他补一个，当着是新会话
    if (!finalSessionId) {
      finalSessionId = generateUUID();
      setConversationId(finalSessionId);
      // 休息一会儿，让副作用做完再继续往下发请求
      await sleep(300);
    }

    // 1. 同时追加用户消息和loading状态的assistant消息，避免状态更新时序问题
    setMessageList((prev) => [
      ...prev,
      { role: 'user', content: msg, status: 'success' },
      { role: 'assistant', content: '', status: 'loading' },
    ]);

    // 2. 构造 fetch 请求参数
    const controller = new AbortController();
    abortController.current = controller;
    const body = JSON.stringify({
      input: msg,
      options: {
        userId: `${userInfo?.id}`,
        conversationId: finalSessionId,
        action,
      },
    });

    try {
      const response = await fetch(AGENT_BASE_URL, {
        method: 'POST',
        headers: {
          accept: 'text/event-stream',
          'Content-Type': 'application/json',
          'X-User-Id': `${userInfo?.id}`,
        },
        body,
        signal: controller.signal,
      });
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      let assistantContent = '';
      let done = false;
      const decoder = new TextDecoder('utf-8');
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // 逐行处理 data: ...
          chunk.split(/\r?\n/).forEach((line) => {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''));
                if (typeof data.text === 'string') {
                  assistantContent += data.text;
                  setMessageList((prev) => {
                    const updated = [...prev];
                    // 从后往前找最近的loading状态的assistant消息进行更新
                    for (let i = updated.length - 1; i >= 0; i--) {
                      if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
                        updated[i] = {
                          ...updated[i],
                          content: assistantContent,
                          status: 'loading',
                        };
                        break;
                      }
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          });
        }
      }
      // 3. 结束后将 assistant 消息状态设为 success
      setMessageList((prev) => {
        const updated = [...prev];
        // 从后往前找最近的loading状态的assistant消息
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
            updated[i] = {
              ...updated[i],
              content: assistantContent,
              status: 'success',
            };
            break;
          }
        }
        return updated;
      });
    } catch (err) {
      const isAbortError = err instanceof Error && err.name === 'AbortError';
      // 4. 错误时设为 error
      setMessageList((prev) => {
        const updated = [...prev];
        // 从后往前找最近的loading状态的assistant消息
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
            updated[i] = {
              ...updated[i],
              status: 'error',
              content: isAbortError ? '用户取消了操作' : '出错了，请重试',
            };
            break;
          }
        }
        return updated;
      });
    } finally {
      setMessageProcessing(false);
    }
  };

  return (
    <Layout className={style.container}>
      <Sider trigger={null} collapsible theme={'light'} width={260} className={style.sider}>
        {/* 新会话 */}
        <NewChatButton text={'New Chat'} size={'large'} type={'default'} width={'100%'} onClick={handleNewChat} />

        {/* 会话列表 */}
        <div className={style.list}>
          <ChatHistory />
        </div>
      </Sider>

      <Layout>
        <Header className={style.header}>
          <div className={style.title}>{currentChat?.title}</div>

          <div className={style.newChat}>
            <Space>
              <NewChatButton text={'New Chat'} size={'small'} type={'primary'} width={'auto'} onClick={handleNewChat} />
            </Space>
          </div>
        </Header>

        <Content className={style.content}>
          <div className={style.messageList}>
            <MessageList handleSubmitMessage={submitMessage} />
          </div>

          <div className={style.sender}>
            <ChatSender handleSubmitMessage={submitMessage} />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const ChatBoxContainer: React.FC = () => {
  return (
    <ChatBoxProvider>
      <ChatBoxPage />
    </ChatBoxProvider>
  );
};

export default memo(ChatBoxContainer);
