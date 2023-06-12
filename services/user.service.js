import UserModel from '../models/user.model.js';
import ApiError from './appError.js';
import { hash, compare } from 'brcyptjs';
import { v4 } from 'uuid';
import mailservice from './mailservice.js';
import tokenService from './tokenservice.js';
import UserPayloadDto from '../dtos/userPayload.dto.js';

export default class UserService {
  async signup(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw new ApiError.BadRequest(`${email} is already taken`);
    }
    const hashPassword = await hash(password, 10);
    const activationLink = v4();
    const user = await UserModel.create({ email, password: hashPassword });
    await mailservice.sendActivationMail(
      email,
      `$process.env.API_URL/v1/api/activate/${activationLink}`,
    );
    const userPayloadDto = new UserPayloadDto(user);
    const tokens = tokenService.generateTokens(userPayloadDto);
    return { ...tokens, user: userPayloadDto };
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
    const isPassEquals = await compare(password, user.password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Incorrect email or password');
    }
    const userPayloadDto = new UserPayloadDto(user);
    const tokens = tokenService.generateTokens({ ...userPayloadDto });
    await tokenService.saveToken(userPayloadDto.id, tokens.refreshToken);
    return { ...tokens, user: userPayloadDto };
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
    const userPayloadDto = new UserPayloadDto(user);
    const tokens = tokenService.generateTokens({ ...userPayloadDto });

    await tokenService.saveToken(userPayloadDto.id, tokens.refreshToken);
    return { ...tokens, user: userPayloadDto };
  }
}
