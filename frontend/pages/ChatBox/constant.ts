// 对话
export type ChatObject = {
  id: number | string;
  sessionId: string;
  title: string;
  icon: React.ReactNode;
  isVirtual?: boolean;
  orders?: number;
  cateId?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

// 聊天分组
export type ChatCateObject = {
  id: number;
  name: string;
  counts: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

// 消息
export type MessageObject = {
  role: string;
  content: string;
  status: 'loading' | 'success' | 'error';
};
