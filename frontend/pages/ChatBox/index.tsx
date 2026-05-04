import React, { memo, useContext } from 'react';
import { Layout, Space } from 'antd';
import { generateUUID, sleep } from '@commons/utils';
import { MainContext } from '@commons/context';
import { API_BASE_URL } from '@commons/constant';
import { ChatBoxContext, ChatBoxProvider } from './context';
import ChatCate from './ChatCate';
import ChatHistory from './ChatHistory';
import MessageList from './MessageList';
import NewChatButton from './NewChatButton';
import ChatSender from './ChatSender';
import style from './index.module.less';

const { Header, Sider, Content } = Layout;

const ChatBoxPage: React.FC = () => {
  const { userInfo } = useContext(MainContext);

  const {
    currentChat,
    setMessageList,
    abortController,
    setMessageProcessing,
    conversationId,
    setConversationId,
    selectedKnowledgeIds,
  } = useContext(ChatBoxContext);

  // 新对话
  const handleNewChat = () => {
    setConversationId(generateUUID());
  };

  // 提交消息到agent
  const submitMessage = async (msg: string, action?: string) => {
    setMessageProcessing(true);

    // 获取sessionId的顺序：当前选中的对话 --> 新生成的对话ID --> 临时分配一个
    let finalSessionId = currentChat?.sessionId || conversationId || '';
    // 首次进入可能没有conversationId，系统给他补一个，当着是新对话
    if (!finalSessionId) {
      finalSessionId = generateUUID();
      setConversationId(finalSessionId);
      // 休息一会儿，让副作用做完再继续往下发请求
      await sleep(300);
    }

    // 1. 先添加用户消息
    setMessageList((prev) => [...prev, { role: 'user', content: msg, status: 'success' }]);

    // 2. 构造 fetch 请求参数
    const controller = new AbortController();
    abortController.current = controller;
    const useRAG = selectedKnowledgeIds.length > 0;
    const body = JSON.stringify({
      message: msg,
      sessionId: finalSessionId,
      useTools: action !== 'simple', // 默认使用工具调用
      useRAG: useRAG,
      knowledgeIds: selectedKnowledgeIds,
    });

    // 用于跟踪是否已经有assistant消息
    let hasAssistantMessage = false;
    // 用于跟踪是否已收到final事件（收到后不再处理data.content）
    let hasFinalContent = false;

    try {
      const response = await fetch(`${API_BASE_URL}chat/withllm`, {
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

      // 辅助函数：更新或创建assistant消息
      const updateOrCreateAssistantMessage = (content: string, status: 'loading' | 'success' | 'error') => {
        setMessageList((prev) => {
          const updated = [...prev];
          if (!hasAssistantMessage) {
            // 第一次：替换掉空的loading消息
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0 && updated[lastIndex].role === 'user') {
              updated.push({ role: 'assistant', content, status });
              hasAssistantMessage = true;
            }
          } else {
            // 已有assistant消息：更新最后一条assistant消息
            for (let i = updated.length - 1; i >= 0; i--) {
              if (updated[i].role === 'assistant') {
                updated[i] = { ...updated[i], content, status };
                break;
              }
            }
          }
          return updated;
        });
      };

      // 辅助函数：追加assistant消息（用于执行事件）
      const appendAssistantMessage = (content: string, status: 'loading' | 'success' | 'error') => {
        setMessageList((prev) => [...prev, { role: 'assistant', content, status }]);
      };

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
                console.log('[ChatBox] SSE data received:', JSON.stringify(data).substring(0, 200));

                // 处理新格式的执行事件
                if (data.type && data.sessionId === finalSessionId) {
                  console.log('[ChatBox] Processing event:', data.type);

                  // 如果是最终回答，更新消息内容
                  if (data.type === 'final' && data.data?.final?.content) {
                    assistantContent = data.data.final.content;
                    hasFinalContent = true;
                    updateOrCreateAssistantMessage(assistantContent, 'success');
                    return;
                  }

                  // 如果是 thinking 事件
                  if (data.type === 'thinking') {
                    updateOrCreateAssistantMessage(`🤔 ${data.data?.thinking?.message || '正在思考...'}`, 'loading');
                    return;
                  }

                  // 如果是工具调用事件
                  if (data.type === 'tool_call') {
                    const toolName = data.data?.tool_call?.tool || 'unknown';
                    const params = data.data?.tool_call?.params || {};
                    const paramsStr = JSON.stringify(params, null, 2);
                    appendAssistantMessage(`🔧 调用工具: ${toolName}\n\`\`\`json\n${paramsStr}\n\`\`\``, 'success');
                    return;
                  }

                  // 如果是工具开始执行事件
                  if (data.type === 'tool_start') {
                    const toolName = data.data?.tool_start?.tool || 'unknown';
                    appendAssistantMessage(`⚙️ 正在执行 ${toolName}...`, 'loading');
                    return;
                  }

                  // 如果是工具结果事件
                  if (data.type === 'tool_result') {
                    const result = data.data?.tool_result?.result || '';
                    let displayResult = result;
                    try {
                      displayResult = JSON.stringify(JSON.parse(result), null, 2);
                    } catch {
                      // Not JSON, use as-is
                    }
                    const truncated =
                      displayResult.length > 500 ? displayResult.substring(0, 500) + '...' : displayResult;
                    appendAssistantMessage(`✅ 工具执行完成:\n\`\`\`\n${truncated}\n\`\`\``, 'success');
                    return;
                  }

                  // 如果是工具错误事件
                  if (data.type === 'tool_error') {
                    const error = data.data?.tool_error?.error || '未知错误';
                    appendAssistantMessage(`❌ 工具执行失败: ${error}`, 'error');
                    return;
                  }

                  return;
                } else if (data.type) {
                  console.log('[ChatBox] SessionId mismatch:', data.sessionId, 'vs', finalSessionId);
                }

                // 处理旧格式的响应: { content, done, toolCalls }
                // 如果已经收到final事件，不再处理data.content（避免重复追加）
                if (data.content && !hasFinalContent) {
                  assistantContent += data.content;
                  updateOrCreateAssistantMessage(assistantContent, 'loading');
                }
                // 处理错误
                if (data.error) {
                  updateOrCreateAssistantMessage(data.error, 'error');
                }
              } catch (e) {
                // 忽略解析错误
                console.warn(e);
              }
            }
          });
        }
      }
      // 流结束后，如果assistant消息还是loading状态且没有内容，设为成功
      setMessageList((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant' && updated[i].status === 'loading') {
            updated[i] = { ...updated[i], content: assistantContent, status: 'success' };
            break;
          }
        }
        return updated;
      });
    } catch (err) {
      const isAbortError = err instanceof Error && err.name === 'AbortError';
      // 错误时设为 error
      setMessageList((prev) => {
        const updated = [...prev];
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
        {/* 新对话 */}
        <NewChatButton text={'New Chat'} size={'large'} type={'default'} width={'100%'} onClick={handleNewChat} />

        {/* 对话列表 */}
        <div className={style.list}>
          <ChatCate />
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
            <MessageList />
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
