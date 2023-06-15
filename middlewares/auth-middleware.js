import ApiError from '../services/appError.js';
import tokenService from '../services/tokenservice.js';
import UserModel from '../models/user.model.js';

export async function isAuth(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthenticatedError());
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthenticatedError());
    }

    const userData = tokenService.validateAccessToken(accessToken);

    const currentUser = await UserModel.findById(userData.id);
    if (!currentUser) {
      return next(ApiError.UnauthenticatedError());
    }

    if (currentUser.changedPasswordAfter(userData.iat)) {
      return next(new ApiError(401, 'User recently changed password. Please login again'));
    }

    req.user = currentUser;
    next();
  } catch (e) {
    return next(ApiError.UnauthenticatedError());
  }
}

export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(ApiError.UnauthorizedError());
    }
    next();
  };
}
