import ApiError from '../services/appError.js';
import logger from '../config/logger.js';

export default function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }
  logger.error(err);
  return res.status(500).json({ message: 'Something went wrong' });
}
