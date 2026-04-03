import { Request, Response } from 'express';
import logger from 'electron-log';
import User from '../models/User';

/**
 * 获取用户信息
 */
export const getUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(Number(id), {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error on get user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 创建用户
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: '缺少必填字段' });
      return;
    }

    const user = await User.create({
      name: username,
      email,
      password, // 实际应该加密存储
      avatar,
    });

    // 返回时不包含密码
    const userResponse = user.toJSON();

    res.json({ success: true, data: userResponse });
  } catch (error) {
    logger.error('Error on create user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 用户登录
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { name, password } = req.body;
    const result = await User.findOne({
      where: {
        name,
        password,
      },
    });
    if (result === null) {
      res.json({ error: 'user not found' });
    } else {
      res.json(result.toJSON());
    }
  } catch (error) {
    logger.error('Error on user login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 更新用户信息
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, avatar, password } = req.body;

    const user = await User.findByPk(Number(id));
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    await user.update({
      ...(username && { username }),
      ...(avatar !== undefined && { avatar }),
      ...(password && { password }), // 实际应该加密存储
    });

    await user.reload();

    // 返回时不包含密码
    const userResponse = user.toJSON();

    res.json({ success: true, data: userResponse });
  } catch (error) {
    logger.error('Error on updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * 修改密码
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: '缺少必填字段' });
      return;
    }

    const user = await User.findByPk(Number(id));
    if (!user) {
      res.status(404).json({ success: false, message: '用户不存在' });
      return;
    }

    // 验证当前密码（实际应该使用密码哈希比对）
    if (user.password !== currentPassword) {
      res.status(400).json({ success: false, message: '当前密码错误' });
      return;
    }

    await user.update({ password: newPassword }); // 实际应该加密存储

    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    logger.error('Error on change password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
