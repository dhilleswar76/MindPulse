import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mindpulse',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: process.env.JWT_SECRET || 'mindpulse_default_jwt_secret_demo_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  mlServiceApiKey: process.env.ML_SERVICE_API_KEY || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || '',
  isNonDiagnostic: true,
};

