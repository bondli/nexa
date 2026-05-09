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
import SkillManage from './SkillManage';
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

      // 辅助函数：创建新assistant消息
      const createAssistantMessage = (content: string, status: 'loading' | 'success' | 'error') => {
        setMessageList((prev) => [...prev, { role: 'assistant', content, status }]);
      };

      // 辅助函数：追加assistant消息
      const appendAssistantMessage = createAssistantMessage;

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

                  // 如果是最终回答，创建新消息
                  if (data.type === 'final' && data.data?.final?.content) {
                    assistantContent = data.data.final.content;
                    hasFinalContent = true;
                    appendAssistantMessage(assistantContent, 'success');
                    return;
                  }

                  // 如果是 thinking 事件
                  if (data.type === 'thinking') {
                    createAssistantMessage(`🤔 ${data.data?.thinking?.message || '正在思考...'}`, 'loading');
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
                    let displayContent = result;

                    // 尝试解析 LangChain 封装的 JSON 格式
                    try {
                      const parsed = JSON.parse(result);
                      // 如果有 kwargs.content，说明是 LangChain 的 ToolMessage 格式
                      if (parsed.kwargs?.content) {
                        const innerContent = JSON.parse(parsed.kwargs.content);
                        if (innerContent.success !== undefined) {
                          // 如果内层是工具的实际返回，格式化显示
                          if (innerContent.message) {
                            displayContent = innerContent.message;
                          } else if (innerContent.results) {
                            displayContent = `找到 ${innerContent.results.length} 条结果`;
                          }
                        }
                      } else if (parsed.content) {
                        displayContent = parsed.content;
                      }
                    } catch {
                      // 不是 JSON 或解析失败，保留原值
                    }

                    const truncated =
                      displayContent.length > 200 ? displayContent.substring(0, 200) + '...' : displayContent;
                    appendAssistantMessage(`✅ 工具执行完成: ${truncated}`, 'success');
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
                  createAssistantMessage(assistantContent, 'loading');
                }
                // 处理错误
                if (data.error) {
                  createAssistantMessage(data.error, 'error');
                }
              } catch (e) {
                // 忽略解析错误
                console.warn(e);
              }
            }
          });
        }
      }
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
        <NewChatButton text={'New Chat'} size={'large'} type={'primary'} width={'100%'} onClick={handleNewChat} />

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
              {/* Skills 管理入口 */}
              <SkillManage />
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
