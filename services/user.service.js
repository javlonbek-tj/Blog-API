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
    const user = await UserModel.create({ email, password: hashPassword, firstname, lastname });
    try {
      await mailService.sendActivationMail(
        email,
        `${process.env.API_URL}/v1/api/activate/${activationLink}`,
      );
    } catch (e) {
      console.log(e);
    }
    const tokens = tokenService.generateTokens(user._id, user.email);
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
    const tokens = tokenService.generateTokens(user._id, user.email);
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
    const tokens = tokenService.generateTokens(user._id, user.email);
    await tokenService.saveToken(user._id, tokens.refreshToken);
    return { ...tokens, user };
  }
}

export default new UserService();
