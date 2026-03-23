import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/studyq',
  jwtSecret: process.env.JWT_SECRET || 'studyq-dev-secret-change-in-prod',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'studyq-refresh-secret-change-in-prod',
  jwtExpiry: 900 as number,         // 15 minutes in seconds
  jwtRefreshExpiry: 604800 as number, // 7 days in seconds
  cookieSecret: process.env.COOKIE_SECRET || 'studyq-cookie-secret-change-in-prod',
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
  maxFileSize: 50 * 1024 * 1024, // 50MB
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',
};
