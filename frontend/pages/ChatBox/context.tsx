import React, { createContext, useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import request from '@commons/request';
import { ChatObject, ChatCateObject, MessageObject } from './constant';

type ChatBoxContextType = {
  currentChat: ChatObject;
  setCurrentChat: React.Dispatch<React.SetStateAction<ChatObject>>;
  // 未分组的对话列表
  chatList: ChatObject[];
  setChatList: React.Dispatch<React.SetStateAction<ChatObject[]>>;
  // 对话分组
  chatCates: ChatCateObject[];
  setChatCates: React.Dispatch<React.SetStateAction<ChatCateObject[]>>;
  messageList: MessageObject[];
  setMessageList: React.Dispatch<React.SetStateAction<MessageObject[]>>;
  getChatList: () => void;
  getChatCateList: () => Promise<void>;
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
  const [chatCates, setChatCates] = useState<ChatCateObject[]>([]);
  const [messageList, setMessageList] = useState([]);
  const [conversationId, setConversationId] = useState('');

  // 获取对话列表（包含分组信息）
  const getChatList = async () => {
    const response = await request.get('/chat/list');
    setChatList(response.data || []);
  };

  // 获取分组列表
  const getChatCateList = async () => {
    const response = await request.get('/chat_cate/list');
    setChatCates(response.data || []);
  };

  // 获取消息列表
  const getMessageList = async () => {
    const response = await request.get(`/chat/msglist?sessionId=${currentChat?.sessionId}`);
    setMessageList(response.data || []);
  };

  // 新增对话
  const addConversation = async (conversationId) => {
    const response = await request.post('/chat/add', {
      title: `新对话${dayjs().format('DD/MMTHH:mm:ss')}`,
      sessionId: conversationId,
    });
    const chatData = response.data;
    setChatList((prev) => [chatData, ...prev]);
    // 并且选中当前的对话
    setCurrentChat(chatData);
  };

  // 消息发送和处理响应中
  const [messageProcessing, setMessageProcessing] = useState(false);

  // 消息发送取消器
  const abortController = useRef<AbortController | null>(null);

  // 切换对话时的副作用
  useEffect(() => {
    if (currentChat && currentChat.sessionId) {
      getMessageList();
    }
  }, [currentChat]);

  // 新对话时的副作用（1、清理当前消息列表；2、如上次对话还没结束，执行取消；3、增加一个对话）
  useEffect(() => {
    setMessageList([]);
    abortController.current?.abort();
    conversationId && addConversation(conversationId);
  }, [conversationId]);

  useEffect(() => {
    getChatCateList();
  }, []);

  return (
    <ChatBoxContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        chatList,
        setChatList,
        chatCates,
        setChatCates,
        getChatList,
        getChatCateList,
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
