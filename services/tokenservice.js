import jwt from 'jsonwebtoken';
import TokenModel from '../models/token.model.js';
import { config } from 'dotenv';
config();

class TokenService {
  generateTokens(id, email) {
    const accessToken = jwt.sign({ id, email }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: '15s',
    });
    const refreshToken = jwt.sign({ id, email }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '30s',
    });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    const token = await TokenModel.create({ user: userId, refreshToken });
    return token;
  }
  async removeToken(refreshToken) {
    const tokenData = await TokenModel.deleteOne({ refreshToken });
    return tokenData;
  }
  async findToken(refreshToken) {
    const tokenData = await TokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
