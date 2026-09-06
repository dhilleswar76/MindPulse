import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export const connectDatabase = async (): Promise<boolean> => {
  if (isConnected) return true;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnected = true;
    logger.info('Connected to MongoDB database successfully.');
    return true;
  } catch (err: any) {
    logger.warn(`MongoDB not reachable at ${config.mongodbUri}. Operating in fallback mode for rapid development/prototype:`, err.message);
    isConnected = false;
    return false;
  }
};

export const getDbStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
});
