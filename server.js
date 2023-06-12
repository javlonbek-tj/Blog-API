import http from 'http';
import app from './app.js';
import mongoConnect from './services/mongo.js';

import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
}

startServer();
