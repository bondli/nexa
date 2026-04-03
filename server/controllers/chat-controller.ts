import { Request, Response } from 'express';
import logger from 'electron-log';
import Chat from '../models/Chat';
import { getMessages as getAllMessages, deleteMessages } from '../services/chat-service';

// 新增一个会话
export const createChat = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { title, sessionId } = req.body;
    const result = await Chat.create({ title, sessionId, userId });
    res.status(200).json(result.toJSON());
  } catch (error) {
    logger.error('Error on creating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询一个会话详情
export const getChatInfo = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;
    const result = await Chat.findOne({
      where: {
        sessionId: sessionId as string,
      },
    });
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'chat not found' });
    }
  } catch (error) {
    logger.error('Error on getting chat by sessionId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询所有会话
export const getChats = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { count, rows } = await Chat.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    logger.error('Error on getting chats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新会话
export const updateChat = async (req: Request, res: Response) => {
  try {
    const { title, sessionId } = req.body;
    const result = await Chat.findOne({
      where: {
        sessionId,
      },
    });
    if (result) {
      await result.update({ title });
      res.json(result.toJSON());
    } else {
      res.json({ error: 'chat not found' });
    }
  } catch (error) {
    logger.error('Error on updating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 删除会话
export const deleteChat = async (req: Request, res: Response) => {
  // const userId = req.headers['x-user-id'];
  try {
    const { sessionId } = req.body;
    const result = await Chat.findOne({
      where: {
        sessionId,
      },
    });
    if (result) {
      // 删除会话对应的所有消息
      const deleteResult = await deleteMessages(sessionId);

      // 删除会话记录
      await result.destroy();
      res.json({
        message: 'chat deleted successfully',
        deletedMessages: deleteResult,
      });
    } else {
      res.json({ error: 'chat not found' });
    }
  } catch (error) {
    logger.error('Error on deleting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取会话的消息列表
export const getMessages = async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      message: 'sessionId is required',
    });
  }

  try {
    const messages = await getAllMessages(sessionId as string);
    // console.log(messages);

    // 转换为前端需要的格式
    const output = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      // timestamp: msg.timestamp
    }));

    res.json({
      data: output,
      count: output.length,
    });
  } catch (error) {
    logger.error('[ChatController] Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: '获取消息列表时发生错误',
      error: error.message,
    });
  }
};

export const chatToLLM = async (req: Request, res: Response) => {
  // TODO: 实现与 LLM 交互的逻辑
  res.json({ message: 'Hello World' });
};
