// 会话
export type ChatObject = {
  id: number | string;
  sessionId: string;
  title: string;
  icon: React.ReactNode;
  isVirtual?: boolean;
  orders?: number;
};

// 消息
export type MessageObject = {
  role: string;
  content: string;
  status: 'loading' | 'success' | 'error';
};