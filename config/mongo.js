import mongoose from 'mongoose';
import logger from './logger.js';

import { config } from 'dotenv';
config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready');
});

mongoose.connection.on('error', err => {
  logger.error(err);
});

export default async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}
