import express from 'express';
import cookieParser from 'cookie-parser';
import api from './routes/api.js';
import errorMiddleware from './middlewares/error-middleware.js';
import cors from 'cors';
import('express-async-errors');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.use('/api/v1', api);

//404 error
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `${req.originalUrl} - Route Not Found`,
  });
});
app.use(errorMiddleware);

export default app;
