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

  allowedOrigin: process.env.FRONTEND_DOMAIN,

  dbUser: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbAppName: process.env.DB_APP_NAME,

  pwdMaxRetryAttempts: process.env.PWD_MAX_RETRY_ATTEMPTS,
  pwdMaxForgetRetryAttempts: process.env.PWD_MAX_FORGET_RETRY_ATTEMPTS,
  pwdResetOTPExpireTime: process.env.PWD_RESET_OTP_EXPIRE_TIME,

  smtpFromName: process.env.SMTP_FROM_NAME,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
};

export default config;
