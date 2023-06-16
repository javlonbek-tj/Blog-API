import UserModal from '../models/user.model.js';
import ApiError from './appError.js';
import bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
import mailService from './mailservice.js';
import tokenService from './tokenservice.js';
import crypto from 'crypto';
import { config } from 'dotenv';
import PostModal from '../models/post.model.js';
import CommentModal from '../models/comment.model.js';
import CategoryModal from '../models/category.model.js';

config();

const createAndSaveTokens = async user => {
  const payload = { id: user._id, email: user.email };
  const tokens = tokenService.generateTokens(payload);
  await tokenService.saveToken(user._id, tokens.refreshToken);
  user.password = undefined;
  return { ...tokens, user };
};

class UserService {
  async signup(email, password, passwordConfirm, firstname, lastname) {
    const candidate = await UserModal.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`${email} is already taken`);
    }
    if (password !== passwordConfirm) {
      throw ApiError.BadRequest('Passwords are not the same');
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const activationLink = v4();
    const user = await UserModal.create({
      email,
      password: hashPassword,
      firstname,
      lastname,
      activationLink,
    });
    /* try {
      const subject = 'Your activation link';
      const link = `${process.env.API_URL}/v1/users/activate/${activationLink}`
      const html = `<div>
            <h1>For activation hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`
      await mailService.sendActivationMail(
        email,
        subject,
        html
      );
    } catch (e) {
      await Usermodal.deleteOne({email})
      throw new ApiError(500, 'There was an error sending the email. Try again later!')
    } */
    return createAndSaveTokens(user);
  }

  async activate(activationLink) {
    const user = await UserModal.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Incorrect activationLink');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModal.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.BadRequest('Incorrect email or password');
    }
    const isPassEquals = await bcrypt.compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect email or password');
    }
    return createAndSaveTokens(user);
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
    const user = await UserModal.findById(userData.id);
    return createAndSaveTokens(user);
  }

  async findOne(userId) {
    const user = await UserModal.findById(userId);
    if (!user) {
      throw ApiError.BadRequest('User not Found');
    }
    return user;
  }

  async uploadUserPhoto(file, user) {
    if (user.isBlocked) {
      throw ApiError.UnauthorizedError();
    }
    const updatedUser = await UserModal.findByIdAndUpdate(
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

  async visitUserProfile(userId, userWhoIsViewing) {
    const userToBeViewed = await UserModal.findById(userId);
    if (userToBeViewed && userWhoIsViewing) {
      // 1. Check if userWhoViewed is already in user's viewers array
      const isUserAlreadyViewed = userToBeViewed.viewers.find(
        viewer => viewer.toString() === userWhoIsViewing._id.toString(),
      );
      if (isUserAlreadyViewed) {
        return userToBeViewed;
      }
      userToBeViewed.viewers.push(userWhoIsViewing._id);
      await userToBeViewed.save();
      return userToBeViewed;
    }
    throw ApiError.BadRequest('User not found');
  }

  async followUser(followedUserId, userWhoIsFollowing) {
    const userToBeFollowed = await UserModal.findById(followedUserId);
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
    const userToBeUnFollowed = await UserModal.findById(unFollowedUserId);

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
    const userToBeBlocked = await UserModal.findById(userId);

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
    const userToBeUnblocked = await UserModal.findById(userId);

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
    const user = await UserModal.findById(userId);
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
    const user = await UserModal.findById(userId);
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

  async updateUserInfo(user, body) {
    if (user.email === body.email) {
      return user;
    }
    const isEmailTaken = await UserModal.findOne({ email: body.email });
    if (isEmailTaken) {
      throw ApiError.BadRequest(`${body.email} is already taken`);
    }
    const updatedUser = await UserModal.findByIdAndUpdate(user._id, body, {
      new: true,
      runValidators: true,
    });
    return updatedUser;
  }

  async updateUserPassword(userId, oldPass, newPass, newPassConfirm) {
    const user = await UserModal.findById(userId).select('+password');

    const isPassEquals = await bcrypt.compare(oldPass, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('OldPassword is incorrect');
    }

    if (newPass !== newPassConfirm) {
      throw ApiError.BadRequest('Passwords are not the same');
    }
    const hashedPassword = await bcrypt.hash(newPass, 10);
    user.password = hashedPassword;
    await user.save();
    return createAndSaveTokens(user);
  }

  async forgotPassword(email, protocol, host) {
    const user = await UserModal.findOne(email);
    if (!user) {
      throw ApiError.BadRequest('User with this email not Found');
    }
    const resetToken = user.createPasswordResetToken();
    const resetUrl = `${protocol}://${host}/api/v1/users/resetPassword/${resetToken}`;

    // Send resetUrl to user's email
    try {
      const subject = 'Your password reset token (valid for only 10 minutes)';
      const link = `${protocol}://${host}/api/v1/users/resetPassword/${resetUrl}`;
      const html = `<div>
            <h1>For reset password hit this link</h1>
            <a href="${link}">${link}</a>
            </div>`;
      await mailService.sendMail(email, subject, html);
    } catch (e) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw new ApiError(500, 'There was an error sending the email. Try again later!');
    }
  }

  async resetPassword(resetToken, password) {
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await UserModal.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.BadRequest('Token is invalid or has expired');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return createAndSaveTokens(user);
  }

  async deleteAccount(userId) {
    await PostModal.deleteMany({ user: userId });
    await CommentModal.deleteMany({ user: userId });
    await CategoryModal.deleteMany({ user: userId });
    const deletedUser = await UserModal.findByIdAndRemove(userId);
    return deletedUser;
  }
}

export default new UserService();
