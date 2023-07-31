import { validationResult } from 'express-validator';
import ApiError from '../services/appError.js';
import userService from '../services/user.service.js';


class UserController {
  async signup(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Validation error', errors.array()));
      }
      const { email, password, firstname, lastname, passwordConfirm } = req.body;
      const userData = await userService.signup(
        email,
        password,
        passwordConfirm,
        firstname,
        lastname,
      );
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(201).json({
        status: 'success',
        userData,
      });
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await userService.login(email, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({
        status: 'success',
        userData,
      });
    } catch (e) {
      next(e);
    }
  }
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.status(200).json({
        status: 'success',
        message: 'You have successfully logged out',
      });
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
      return res.status(200).json({
        status: 'success',
      });
    } catch (e) {
      next(e);
    }
  }

  async findOne(req, res, next) {
    try {
      const user = await userService.findOne(req.params.id);
      return res.status(200).json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async uploadUserPhoto(req, res, next) {
    try {
      const updatedUser = await userService.uploadUserPhoto(req.file.path, req.user);
      return res.status(200).json({
        status: 'success',
        user: updatedUser,
      });
    } catch (e) {
      next(e);
    }
  }

  async visitUserProfile(req, res, next) {
    try {
      const userToBeViewed = await userService.visitUserProfile(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        user: userToBeViewed,
      });
    } catch (e) {
      next(e);
    }
  }

  async followUser(req, res, next) {
    try {
      const userWhoIsFollowing = await userService.followUser(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        user: userWhoIsFollowing,
      });
    } catch (e) {
      next(e);
    }
  }

  async unFollowUser(req, res, next) {
    try {
      const userWhoIsUnFollowing = await userService.unFollowUser(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        user: userWhoIsUnFollowing,
      });
    } catch (e) {
      next(e);
    }
  }

  async blockUser(req, res, next) {
    try {
      const userWhoIsBlocking = await userService.blockUser(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        user: userWhoIsBlocking,
      });
    } catch (e) {
      next(e);
    }
  }

  async unBlockUser(req, res, next) {
    try {
      const userWhoIsUnBlocking = await userService.unBlockUser(req.params.id, req.user);
      return res.status(200).json({
        status: 'success',
        user: userWhoIsUnBlocking,
      });
    } catch (e) {
      next(e);
    }
  }

  async adminBlockUser(req, res, next) {
    try {
      const user = await userService.adminBlockUser(req.params.id);
      return res.status(200).json({
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
      return res.status(200).json({
        status: 'success',
        user,
      });
    } catch (e) {
      next(e);
    }
  }

  async updatedUserInfo(req, res, next) {
    try {
      const { firstname, lastname, email } = req.body;
      const updatingFields = {
        email,
        firstname,
        lastname,
      };
      const updatedUser = await userService.updatedUserInfo(req.user, updatingFields);
      return res.status(200).json({
        status: 'success',
        user: updatedUser,
      });
    } catch (e) {
      next(e);
    }
  }

  async updateUserPassword(req, res, next) {
    try {
      const { oldPass, newPass, newPassConfirm } = req.body;
      await userService.updateUserPassword(req.user._id, oldPass, newPass, newPassConfirm);
      return res.status(200).json({
        status: 'success',
        message: 'You have successfully changed your password!',
      });
    } catch (e) {
      next(e);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const host = req.get('host');
      const protocol = req.protocol;
      await userService.forgotPassword(email, protocol, host);
      res.status(200).json({
        status: 'success',
        message: 'ResetToken sent to your email!',
      });
    } catch (e) {
      next(e);
    }
  }

  async resetPassword(req, res, next) {
    const { token } = req.params;
    await userService.resetPassword(token, req.body.password);
    return res.status(200).json({
      status: 'success',
      message: 'You have successfully changed your password!',
    });
  }

  async deleteAccount(req, res, next) {
    await userService.deleteAccount(req.user._id);
    return res.status(204).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  }
}

export default new UserController();
