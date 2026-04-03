import React, { createContext, useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import request from '@commons/request';
import { ChatObject, MessageObject } from './constant';

type ChatBoxContextType = {
  currentChat: ChatObject;
  setCurrentChat: React.Dispatch<React.SetStateAction<ChatObject>>;
  chatList: ChatObject[];
  setChatList: React.Dispatch<React.SetStateAction<ChatObject[]>>;
  messageList: MessageObject[];
  setMessageList: React.Dispatch<React.SetStateAction<MessageObject[]>>;
  getChatList: () => void;
  getMessageList: () => void;
  messageProcessing: boolean;
  setMessageProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  conversationId: string;
  setConversationId: React.Dispatch<React.SetStateAction<string>>;
  abortController: React.MutableRefObject<AbortController | null>;
};

export const ChatBoxContext = createContext<ChatBoxContextType | undefined>(undefined);
export const ChatBoxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentChat, setCurrentChat] = useState<ChatObject>(null);
  const [chatList, setChatList] = useState([]);
  const [messageList, setMessageList] = useState([]);
  const [conversationId, setConversationId] = useState('');

  // 获取会话列表
  const getChatList = async () => {
    const response = await request.get('/conversation/list');
    const result = response.data;
    setChatList(result.data);
  };

  // 获取消息列表
  const getMessageList = async () => {
    const response = await request.get(`/conversation/msglist?sessionId=${currentChat?.sessionId}`);
    const result = response.data;
    setMessageList(result.data);
  };

  // 新增会话
  const addConversation = async (conversationId) => {
    const response = await request.post('/conversation/add', {
      title: `新会话${dayjs().format('DD/MMTHH:mm:ss')}`,
      sessionId: conversationId,
    });
    const result = response.data;
    setChatList((prev) => [
      result, // 新创建的会话加入到列表中
      ...prev,
    ]);
    // 并且选中当前的会话
    setCurrentChat(result);
  };

  // 消息发送和处理响应中
  const [messageProcessing, setMessageProcessing] = useState(false);

  // 消息发送取消器
  const abortController = useRef<AbortController | null>(null);

  // 切换会话时的副作用
  useEffect(() => {
    if (currentChat && currentChat.sessionId) {
      getMessageList();
    }
  }, [currentChat]);

  // 新会话时的副作用（1、清理当前消息列表；2、如上次对话还没结束，执行取消；3、增加一个会话）
  useEffect(() => {
    setMessageList([]);
    abortController.current?.abort();
    conversationId && addConversation(conversationId);
  }, [conversationId]);

  return (
    <ChatBoxContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        chatList,
        setChatList,
        getChatList,
        messageList,
        setMessageList,
        getMessageList,
        messageProcessing,
        setMessageProcessing,
        conversationId,
        setConversationId,
        abortController,
      }}
    >
      {children}
    </ChatBoxContext.Provider>
  );
};
