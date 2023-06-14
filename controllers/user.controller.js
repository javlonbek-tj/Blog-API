import { validationResult } from 'express-validator';
import ApiError from '../services/appError.js';
import userService from '../services/user.service.js';

class UserController {
  async signup(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation error', errors.array()));
      }
      const { email, password, firstname, lastname } = req.body;
      const userData = await userService.signup(email, password, firstname, lastname);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json('Logout successfully');
    } catch (e) {
      next(e);
    }
  }
  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async findOne(req, res, next) {
    try {
      const user = await userService.findOne(req.params.id);
      return res.json(user);
    } catch (e) {
      next(e);
    }
  }

  async uploadUserPhoto(req, res, next) {
    try {
      const updatedUser = await userService.uploadUserPhoto(req.file.path, req.user);
      return res.json({
        status: 'success',
        updatedUser,
      });
    } catch (e) {
      next(e);
    }
  }

  async visitUserProfile(req, res, next) {
    try {
      const user = await userService.visitUserProfile(req.params.id, req.user);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async followUser(req, res, next) {
    try {
      const user = await userService.followUser(req.params.id, req.user);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async unFollowUser(req, res, next) {
    try {
      const user = await userService.unFollowUser(req.params.id, req.user);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async blockUser(req, res, next) {
    try {
      const user = await userService.blockUser(req.params.id, req.user);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async unBlockUser(req, res, next) {
    try {
      const user = await userService.unBlockUser(req.params.id, req.user);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async adminBlockUser(req, res, next) {
    try {
      const user = await userService.adminBlockUser(req.params.id);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async adminUnBlockUser(req, res, next) {
    try {
      const user = await userService.adminUnBlockUser(req.params.id);
      return res.json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
