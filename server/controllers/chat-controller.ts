import { Request, Response } from 'express';
import logger from 'electron-log';
import Chat from '../models/Chat';
import ChatCate from '../models/ChatCate';
import { getMessages as getAllMessages, deleteMessages } from '../services/chat-service';
import { createAgent, loadLLMConfig } from '../services/ai-service';
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

// 查询所有会话（查询所有未分组的会话）
export const getChats = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { count, rows } = await Chat.findAndCountAll({
      where: { userId, cateId: null },
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

/**
 * 与 LLM 对话（SSE 流式返回）
 * 使用 LangGraph + MySQL Checkpoint 实现消息持久化
 * 预留知识库对话接口：后续支持选择知识库来对话，知识库的内容被向量化了
 * 预留向量检索接口：调用工具时使用向量相似度搜索相关笔记
 */
export const chatToLLM = async (req: Request, res: Response) => {
  const { message, sessionId, useTools = true } = req.body;

  if (!message) {
    badRequest(res, 'message is required');
    return;
  }

  if (!sessionId) {
    badRequest(res, 'sessionId is required');
    return;
  }

  // 设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    // 加载 LLM 配置
    const llmConfig = loadLLMConfig();

    if (!llmConfig.apiKey) {
      res.write(`data: ${JSON.stringify({ error: '请先配置 LLM API Key' })}\n\n`);
      res.end();
      return;
    }

    // 创建 Agent 实例（会自动加载工具和 checkpoint saver）
    const agent = await createAgent();

    // 获取历史消息（从 checkpoints 表读取）
    const historyMessages = await getAllMessages(sessionId);

    // 构建消息列表
    const messages: Array<{ role: string; content: string }> = [
      ...historyMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // 流式回调
    const streamCallback = (content: string, done: boolean, toolCalls?: string[]) => {
      const data = {
        sessionId,
        content,
        done,
        toolCalls,
      };
      res.write(`data: ${JSON.stringify(data)}\n\n`);

      // 如果完成且有工具调用
      if (done && toolCalls && toolCalls.length > 0) {
        logger.info(`[chatToLLM] 工具调用完成: ${toolCalls.join(', ')}`);
      }
    };

    // 调用 Agent，传入 sessionId 作为 threadId
    // 这样消息会自动持久化到 MySQL checkpoints 表
    if (useTools) {
      await agent.chat(messages, sessionId, streamCallback);
    } else {
      await agent.simpleChat(messages, sessionId, streamCallback);
    }

    // 发送结束信号
    res.write(`data: ${JSON.stringify({ done: true, sessionId })}\n\n`);
    res.end();
  } catch (error) {
    logger.error('[chatToLLM] Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: String(error) })}\n\n`);
    res.end();
  }
};
