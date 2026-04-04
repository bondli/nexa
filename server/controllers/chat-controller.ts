import { Request, Response } from 'express';
import logger from 'electron-log';
import Chat from '../models/Chat';
import { getMessages as getAllMessages, deleteMessages } from '../services/chat-service';
import { success, successWithPage, notFound, badRequest, serverError } from '../utils/response';

// 新增一个会话
export const createChat = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { title, sessionId } = req.body;
    const result = await Chat.create({ title, sessionId, userId });
    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error on creating chat:', error);
    serverError(res, 'Error creating chat');
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
      success(res, result.toJSON());
    } else {
      notFound(res, 'Chat not found');
    }
  } catch (error) {
    logger.error('Error on getting chat by sessionId:', error);
    serverError(res, 'Error getting chat');
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
    successWithPage(res, rows || [], count || 0);
  } catch (error) {
    logger.error('Error on getting chats:', error);
    serverError(res, 'Error getting chats');
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
      success(res, result.toJSON());
    } else {
      notFound(res, 'Chat not found');
    }
  } catch (error) {
    logger.error('Error on updating chat:', error);
    serverError(res, 'Error updating chat');
  }
};

// 删除会话
export const deleteChat = async (req: Request, res: Response) => {
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
      success(res, { deletedMessages: deleteResult }, 'chat deleted successfully');
    } else {
      notFound(res, 'Chat not found');
    }
  } catch (error) {
    logger.error('Error on deleting chat:', error);
    serverError(res, 'Error deleting chat');
  }
};

// 获取会话的消息列表
export const getMessages = async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    badRequest(res, 'sessionId is required');
    return;
  }

  try {
    const messages = await getAllMessages(sessionId as string);

    // 转换为前端需要的格式
    const output = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    successWithPage(res, output, output.length);
  } catch (error) {
    logger.error('[ChatController] Error getting messages:', error);
    serverError(res, 'Error getting messages');
  }
};

export const chatToLLM = async (req: Request, res: Response) => {
  // TODO: 实现与 LLM 交互的逻辑
  success(res, { message: 'Hello World' });
};
