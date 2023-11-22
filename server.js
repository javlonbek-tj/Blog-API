import http from 'http';
import app from './app.js';
import mongoConnect from './config/mongo.js';
import logger from './config/logger.js';

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

startServer();
