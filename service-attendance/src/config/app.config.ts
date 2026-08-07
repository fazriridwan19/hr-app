import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port:      parseInt(process.env.APP_PORT ?? '3001', 10),
  env:       process.env.APP_ENV  ?? 'development',
  name:      process.env.APP_NAME ?? 'service-attendance',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  uploadDir:  process.env.UPLOAD_DIR  ?? 'uploads/attendance',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '5242880', 10),
}));
