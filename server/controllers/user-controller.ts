import { Request, Response } from 'express';
import logger from 'electron-log';
import User from '../models/User';
import { success, notFound, badRequest, serverError } from '../utils/response';

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
      notFound(res, '用户不存在');
      return;
    }

    success(res, user);
  } catch (error) {
    logger.error('Error on get user info:', error);
    serverError(res, 'Error getting user info');
  }
};

/**
 * 创建用户
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, avatar } = req.body;

    if (!username || !email || !password) {
      badRequest(res, '缺少必填字段');
      return;
    }

    const user = await User.create({
      name: username,
      email,
      password,
      avatar,
    });

    const userResponse = user.toJSON();
    success(res, userResponse);
  } catch (error) {
    logger.error('Error on create user:', error);
    serverError(res, 'Error creating user');
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
      notFound(res, '用户不存在');
    } else {
      success(res, result.toJSON());
    }
  } catch (error) {
    logger.error('Error on user login:', error);
    serverError(res, 'Error on user login');
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
      notFound(res, '用户不存在');
      return;
    }

    await user.update({
      ...(username && { username }),
      ...(avatar !== undefined && { avatar }),
      ...(password && { password }),
    });

    await user.reload();

    const userResponse = user.toJSON();
    success(res, userResponse);
  } catch (error) {
    logger.error('Error on updating user:', error);
    serverError(res, 'Error updating user');
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
      badRequest(res, '缺少必填字段');
      return;
    }

    const user = await User.findByPk(Number(id));
    if (!user) {
      notFound(res, '用户不存在');
      return;
    }

    if (user.password !== currentPassword) {
      badRequest(res, '当前密码错误');
      return;
    }

    await user.update({ password: newPassword });

    success(res, null, '密码修改成功');
  } catch (error) {
    logger.error('Error on change password:', error);
    serverError(res, 'Error changing password');
  }
};
