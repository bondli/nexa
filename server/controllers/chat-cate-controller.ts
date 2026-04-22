import { Request, Response } from 'express';
import logger from 'electron-log';
import ChatCate from '../models/ChatCate';
import Chat from '../models/Chat';
import { success, notFound, serverError } from '../utils/response';

// 获取分组列表
export const getChatCateList = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const result = await ChatCate.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    success(res, result.map((item) => item.toJSON()));
  } catch (error) {
    logger.error('Error on getting chat cate list:', error);
    serverError(res, 'Error getting chat cate list');
  }
};

// 新增分组
export const addChatCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { name } = req.body;
    if (!name) {
      notFound(res, '分组名称不能为空');
      return;
    }
    const result = await ChatCate.create({ name, userId, counts: 0 });
    success(res, result.toJSON());
  } catch (error) {
    logger.error('Error on adding chat cate:', error);
    serverError(res, 'Error adding chat cate');
  }
};

// 更新分组
export const updateChatCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      notFound(res, '分组id和名称不能为空');
      return;
    }
    const result = await ChatCate.findOne({
      where: { id, userId },
    });
    if (result) {
      await result.update({ name });
      success(res, result.toJSON());
    } else {
      notFound(res, '分组不存在');
    }
  } catch (error) {
    logger.error('Error on updating chat cate:', error);
    serverError(res, 'Error updating chat cate');
  }
};

// 删除分组
export const deleteChatCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id } = req.query;
    if (!id) {
      notFound(res, '分组id不能为空');
      return;
    }
    const result = await ChatCate.findOne({
      where: { id: Number(id), userId },
    });
    if (result) {
      // 将该分组下的会话的 cateId 设为 null
      await Chat.update({ cateId: null }, { where: { cateId: Number(id) } });
      await result.destroy();
      success(res, {}, '分组删除成功');
    } else {
      notFound(res, '分组不存在');
    }
  } catch (error) {
    logger.error('Error on deleting chat cate:', error);
    serverError(res, 'Error deleting chat cate');
  }
};

// 获取分组内的会话列表
export const getChatCateChats = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id } = req.query;
    if (!id) {
      notFound(res, '分组id不能为空');
      return;
    }
    const chats = await Chat.findAll({
      where: { cateId: Number(id), userId },
      order: [['createdAt', 'DESC']],
    });
    // 同时获取所有分组，用于会话移动时选择
    const cates = await ChatCate.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    success(res, { chats: chats.map((c) => c.toJSON()), cates: cates.map((c) => c.toJSON()) });
  } catch (error) {
    logger.error('Error on getting chat cate chats:', error);
    serverError(res, 'Error getting chat cate chats');
  }
};

// 移动会话到分组
export const moveChatToCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { sessionId, cateId } = req.body;
    if (!sessionId) {
      notFound(res, '会话id不能为空');
      return;
    }
    const chat = await Chat.findOne({
      where: { sessionId, userId },
    });
    if (chat) {
      const oldCateId = chat.cateId;

      // 更新会话的 cateId
      await chat.update({ cateId: cateId || null });

      // 更新原分组的 counts
      if (oldCateId) {
        const oldCate = await ChatCate.findOne({ where: { id: oldCateId, userId } });
        if (oldCate && oldCate.counts > 0) {
          await oldCate.update({ counts: oldCate.counts - 1 });
        }
      }

      // 更新目标分组的 counts
      if (cateId) {
        const newCate = await ChatCate.findOne({ where: { id: cateId, userId } });
        if (newCate) {
          await newCate.update({ counts: newCate.counts + 1 });
        }
      }

      success(res, chat.toJSON());
    } else {
      notFound(res, '会话不存在');
    }
  } catch (error) {
    logger.error('Error on moving chat to cate:', error);
    serverError(res, 'Error moving chat to cate');
  }
};

// 删除分组内的会话
export const deleteChatCateChat = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id, cateId } = req.body;
    if (!id) {
      notFound(res, '会话id不能为空');
      return;
    }
    const chat = await Chat.findOne({
      where: { id, userId },
    });
    if (chat) {
      const oldCateId = chat.cateId;
      await chat.destroy();

      // 更新分组的 counts
      if (oldCateId) {
        const cate = await ChatCate.findOne({ where: { id: oldCateId, userId } });
        if (cate && cate.counts > 0) {
          await cate.update({ counts: cate.counts - 1 });
        }
      }

      success(res, {}, '会话删除成功');
    } else {
      notFound(res, '会话不存在');
    }
  } catch (error) {
    logger.error('Error on deleting chat cate chat:', error);
    serverError(res, 'Error deleting chat cate chat');
  }
};

// 重命名分组内的会话
export const renameChatCateChat = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id, title } = req.body;
    if (!id || !title) {
      notFound(res, '会话id和名称不能为空');
      return;
    }
    const chat = await Chat.findOne({
      where: { id, userId },
    });
    if (chat) {
      await chat.update({ title });
      success(res, chat.toJSON());
    } else {
      notFound(res, '会话不存在');
    }
  } catch (error) {
    logger.error('Error on renaming chat cate chat:', error);
    serverError(res, 'Error renaming chat cate chat');
  }
};