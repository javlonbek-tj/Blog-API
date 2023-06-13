import ApiError from '../services/appError.js';
import tokenService from '../services/tokenservice.js';

export default async function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError());
    }

    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError());
    }

    const userData = await tokenService.validateAccessToken(accessToken);
    console.log(userData);
    if (!userData) {
      return next(ApiError.UnauthorizedError());
    }

    req.user = userData._id;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError());
  }
}
