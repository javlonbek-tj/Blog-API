import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


const isDevelopment = process.env.NODE_ENV === 'development';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '7d',
    }),
    isDevelopment ? new winston.transports.Console() : null,
  ].filter(Boolean),
});

export default logger;

