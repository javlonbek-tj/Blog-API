import UserModel from '../models/user.model.js';
import ApiError from './appError.js';
import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
import mailService from './mailservice.js';
import tokenService from './tokenservice.js';
import { config } from 'dotenv';

config();

class UserService {
  async signup(email, password, firstname, lastname) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`${email} is already taken`);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const activationLink = v4();
    const user = await UserModel.create({
      email,
      password: hashPassword,
      firstname,
      lastname,
      activationLink,
    });
    /* try {
      await mailService.sendActivationMail(
        email,
        `${process.env.API_URL}/v1/users/activate/${activationLink}`,
      );
    } catch (e) {
      console.log(e);
    } */
    const payload = {
      id: user._id,
      email: user.email,
    };
    const tokens = tokenService.generateTokens(payload);
    await tokenService.saveToken(user._id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Incorrect activationLink');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Incorrect email or password');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect email or password');
    }
    const payload = {
      id: user._id,
      email: user.email,
    };
    const tokens = tokenService.generateTokens(payload);
    await tokenService.saveToken(user._id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthenticatedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const payload = {
      id: user._id,
      email: user.email,
    };
    const tokens = tokenService.generateTokens(payload);
    await tokenService.saveToken(user._id, tokens.refreshToken);
    return { ...tokens, user };
  }

  async uploadUserPhoto(file, user) {
    if (!user) {
      throw ApiError.BadRequest('User not found');
    }
    if (user.isBlocked) {
      throw ApiError.UnauthorizedError();
    }
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        $set: {
          profilPhoto: file,
        },
      },
      {
        new: true,
      },
    );
    return updatedUser;
  }

  async visitUserProfile(userId, viewingUserId) {
    const user = await UserModel.findById(userId);
    if (user && viewingUserId) {
      // 1. Check if userWhoViewed is already in user's viewers array
      const isUserAlreadyViewed = user.viewers.find(
        viewer => viewer.toString() === viewingUserId.toString(),
      );
      if (isUserAlreadyViewed) {
        return user;
      }
      user.viewers.push(viewingUserId);
      await user.save();
      return user;
    }
    throw ApiError.BadRequest('User not found');
  }

  async followUser(followedUserId, userWhoIsFollowing) {
    const userToBeFollowed = await UserModel.findById(followedUserId);
    if (userToBeFollowed && userWhoIsFollowing) {
      // 1. Check if userWhoIsFollowing is already in user's follewers array
      const isUserAlreadyFollowed = userWhoIsFollowing.following.find(
        follower => follower.toString() === followedUserId.toString(),
      );
      if (isUserAlreadyFollowed) {
        throw new ApiError(400, 'You have already followed this user');
      }
      userToBeFollowed.followers.push(userWhoIsFollowing._id);
      userWhoIsFollowing.following.push(followedUserId);
      await userToBeFollowed.save();
      await userWhoIsFollowing.save();
      return userWhoIsFollowing;
    }
    throw ApiError.BadRequest('User not found');
  }
  async unFollowUser(unFollowedUserId, userWhoIsUnFollowing) {
    const userToBeUnFollowed = await UserModel.findById(unFollowedUserId);

    if (userToBeUnFollowed && userWhoIsUnFollowing) {
      // 1. Check if userWhoIsFollowing is already in user's follewers array
      const isUserAlreadyUnFollowed = userWhoIsUnFollowing.following.find(
        follower => follower.toString() === unFollowedUserId.toString(),
      );
      if (!isUserAlreadyUnFollowed) {
        throw new ApiError(400, 'You have not followed this user');
      }

      userToBeUnFollowed.followers = userToBeUnFollowed.followers.filter(
        follower => follower.toString() !== userWhoIsUnFollowing._id.toString(),
      );
      userWhoIsUnFollowing.following = userWhoIsUnFollowing.following.filter(
        follower => follower.toString() !== unFollowedUserId.toString(),
      );
      await userWhoIsUnFollowing.save();
      await userToBeUnFollowed.save();
      return userWhoIsUnFollowing;
    }
    throw ApiError.BadRequest('User not found');
  }

  async blockUser(userId, userWhoIsBlocking) {
    const userToBeBlocked = await UserModel.findById(userId);

    if (userToBeBlocked && userWhoIsBlocking) {
      // 1. Check if userToBeBlocked is already in user's blocked array
      const isUserAlreadyBlocked = userWhoIsBlocking.blocked.find(
        blockedUser => blockedUser.toString() === userId.toString(),
      );
      if (isUserAlreadyBlocked) {
        throw new ApiError(400, 'You have already blocked this user');
      }

      userWhoIsBlocking.blocked.push(userId);
      await userWhoIsBlocking.save();
      return userWhoIsBlocking;
    }
    throw ApiError.BadRequest('User not found');
  }

  async unBlockUser(userId, userWhoIsUnblocking) {
    const userToBeUnblocked = await UserModel.findById(userId);

    if (userToBeUnblocked && userWhoIsUnblocking) {
      // 1. Check if userToBeUnblocked is already in user's blocked array
      const isUserAlreadyUnBlocked = userWhoIsUnblocking.blocked.find(
        blockedUser => blockedUser.toString() === userId.toString(),
      );
      if (!isUserAlreadyUnBlocked) {
        throw new ApiError(400, 'You have not blocked this user');
      }

      userWhoIsUnblocking.blocked = userWhoIsUnblocking.blocked.filter(
        blockedUser => blockedUser.toString() !== userId.toString(),
      );
      await userWhoIsUnblocking.save();
      return userWhoIsUnblocking;
    }
    throw ApiError.BadRequest('User not found');
  }

  async adminBlockUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not Found');
    }
    if (user.isBlocked) {
      throw ApiError.BadRequest('User already blocked');
    }
    user.isBlocked = true;
    await user.save();
    return user;
  }

  async adminUnBlockUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not Found');
    }
    if (!user.isBlocked) {
      throw ApiError.BadRequest('User is not blocked');
    }
    user.isBlocked = false;
    await user.save();
    return user;
  }
}

export default new UserService();
