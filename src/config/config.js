// config.js
import dotenv from "dotenv";
dotenv.config();

const config = {
  logLevel: process.env.LOG_LEVEL,

  host: process.env.HOST,
  port: process.env.PORT,
  nodeenv: process.env.NODE_ENV,

  jwtSecret: process.env.JWT_SECRET,
  jwtAccessExpireTime: process.env.JWT_ACCESS_EXPIRE_TIME,
  jwtRefreshExpireTime: process.env.JWT_REFRESH_EXPIRE_TIME,

  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  rateLimitMaxAttempts: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS),
  rateLimitSkipSuccess: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',

  allowedOrigin: process.env.FRONTEND_DOMAIN,

  dbUser: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbAppName: process.env.DB_APP_NAME,

  pwdMaxRetryAttempts: process.env.PWD_MAX_RETRY_ATTEMPTS,
  pwdMaxForgetRetryAttempts: process.env.PWD_MAX_FORGET_RETRY_ATTEMPTS,
  pwdResetOTPExpireTime: process.env.PWD_RESET_OTP_EXPIRE_TIME,

  otpLength: parseInt(process.env.OTP_LENGTH || '4'),
  otpMin: Math.pow(10, parseInt(process.env.OTP_LENGTH || '4') - 1),
  otpMax: Math.pow(10, parseInt(process.env.OTP_LENGTH || '4')) - 1,

  smtpFromName: process.env.SMTP_FROM_NAME,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,

  noteTitleMaxLength: process.env.NOTE_TITLE_MAX_LENGTH,
  noteContentMaxLength: process.env.NOTE_CONTENT_MAX_LENGTH,
};

export default config;
