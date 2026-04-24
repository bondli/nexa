import { memo, useContext, useEffect, useRef } from 'react';
import { Typography, Space, Spin, Avatar } from 'antd';
import { UserOutlined, AliwangwangOutlined } from '@ant-design/icons';
import { Bubble, Welcome } from '@ant-design/x';
import markdownit from 'markdown-it';
import { throttle } from 'lodash-es';
import { ChatBoxContext } from '../context';
import style from './index.module.less';

const md = markdownit({ html: true, breaks: true });

const MessageList: React.FC = () => {
  const msgListWrapperRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useRef<any>(null);
  const lastScrollHeight = useRef<number>(0); // 记录上一次的 scrollHeight

  const { messageList, currentChat } = useContext(ChatBoxContext);

  useEffect(() => {
    if (!msgListWrapperRef.current) return;

    // 创建新的 throttle 函数
    scrollToBottom.current = throttle(() => {
      const wrapper = msgListWrapperRef.current;
      if (!wrapper) return;

      // 使用 requestAnimationFrame 确保在下一帧渲染后再滚动
      requestAnimationFrame(() => {
        const currentScrollHeight = wrapper.scrollHeight;

        // 如果高度没有变化，不需要滚动
        if (currentScrollHeight === lastScrollHeight.current) {
          // console.log('scrollHeight not changed:', currentScrollHeight);
          return;
        }

        // 记录新的高度
        lastScrollHeight.current = currentScrollHeight;
        console.log('scrollToBottom:', currentScrollHeight);

        wrapper.scrollTo({
          top: currentScrollHeight,
          behavior: 'smooth',
        });
      });
    }, 100);

    // 首次进入时立即滚动
    scrollToBottom.current();

    return () => {
      if (scrollToBottom.current?.cancel) {
        scrollToBottom.current?.cancel?.();
      }
    };
  }, [messageList.length]); // 依赖消息数量变化

  /** 没有消息时的 welcome */
  if (!messageList?.length || !currentChat?.sessionId) {
    return (
      <Welcome
        variant="borderless"
        title={<div style={{ fontSize: 14, fontWeight: 'bold' }}>你好，我是你的AI小助理</div>}
        description={'我可以帮助你回答问题和解决问题。如：查找工具，天气情况等'}
        className={style.chatWelcome}
      />
    );
  }

  return (
    <div ref={msgListWrapperRef} className={style.container}>
      <Bubble.List
        className={style.bubbleList}
        items={messageList?.map((i, index) => {
          return {
            key: index,
            content: i.content,
            role: i.role,
            // 关键修复：只有在loading状态且没有内容时才显示loading UI
            // 如果有内容，即使是loading状态也要显示内容，实现实时流式效果
            loading: i.status === 'loading' && !i.content.trim(),
            // 优化typing效果：流式状态下使用更快的typing速度，完成状态下禁用typing
            typing:
              i.status === 'loading' && i.content.trim()
                ? { effect: 'typing', step: 1, interval: 10 } // 流式状态：每次1个字符，间隔10ms
                : false, // 非流式状态：禁用typing效果
            contentRender: (content) => {
              return (
                <Typography>
                  <div dangerouslySetInnerHTML={{ __html: md.render(content) }} className={style.markdown} />
                </Typography>
              );
            },
          };
        })}
        role={{
          assistant: {
            placement: 'start',
            avatar: <Avatar icon={<AliwangwangOutlined />} className={style.avatarAssistant} />,
            loadingRender: () => (
              <Space>
                <Spin size="small" />
                生成中，请稍等...
              </Space>
            ),
          },
          system: {
            placement: 'start',
            avatar: <Avatar icon={<AliwangwangOutlined />} className={style.avatarAssistant} />,
          },
          user: {
            placement: 'end',
            avatar: <Avatar icon={<UserOutlined />} className={style.avatarUser} />,
          },
        }}
      />
    </div>
  );
};

export default memo(MessageList);
