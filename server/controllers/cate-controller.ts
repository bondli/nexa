import { Request, Response } from 'express';
import logger from 'electron-log';
import Cate from '../models/Cate';

// 新增一个分类
export const createCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { icon, name, orders } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }
    const result = await Cate.create({
      icon,
      name,
      orders,
      counts: 0,
      userId,
    });
    res.status(200).json(result.toJSON());
  } catch (error) {
    logger.error('Error on creating cate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询一个分类详情
export const getCateInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      res.json(result.toJSON());
    } else {
      res.json({ error: 'Cate not found' });
    }
  } catch (error) {
    logger.error('Error on getting cate by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 查询所有分类
export const getCates = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { count, rows } = await Cate.findAndCountAll({
      where: { userId },
      order: [
        ['orders', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
    res.json({
      count: count || 0,
      data: rows || [],
    });
  } catch (error) {
    logger.error('Error on getting cates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 更新分类
export const updateCate = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    const { icon, name, orders } = req.body;
    // 针对虚拟分类，不能修改
    if (id === 'all' || id === 'today' || id === 'done' || id === 'trash') {
      res.json({ error: 'Virtual cate cannot be modified' });
    }
    const result = await Cate.findByPk(Number(id));
    if (result) {
      await result.update({ icon, name, orders });
      res.json(result.toJSON());
    } else {
      res.json({ error: 'cate not found' });
    }
  } catch (error) {
    logger.error('Error on updating cate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 删除分类
export const deleteCate = async (req: Request, res: Response) => {
  const userId = Number(req.headers['x-user-id']) || 0;
  try {
    const { id } = req.query;
    const result = await Cate.findByPk(Number(id));
    if (result) {
      // 判断这个分类是否属于自己的
      if (result.userId !== Number(userId)) {
        res.json({ error: 'Forbidden', message: '权限不足' });
        return;
      }
      await result.destroy();
      res.json({ message: 'cate deleted successfully' });
    } else {
      res.json({ error: 'cate not found' });
    }
  } catch (error) {
    logger.error('Error on deleting cate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
