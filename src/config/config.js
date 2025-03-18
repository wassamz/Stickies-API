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
  rateLimitSkipSuccess: process.env.RATE_LIMIT_SKIP_SUCCESS === "true",

  allowedOrigin: process.env.FRONTEND_DOMAIN,

  dbUser: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  dbHost: process.env.DB_HOST,
  dbName: process.env.DB_NAME,
  dbAppName: process.env.DB_APP_NAME,
  dbMaxRetries: parseInt(process.env.DB_MAX_RETRIES5 || "5"),
  dbRetryDelay: parseInt(process.env.DB_RETRY_DELAY || "5000"),



  otpLength: parseInt(process.env.OTP_LENGTH || "4"),
  otpMin: Math.pow(10, parseInt(process.env.OTP_LENGTH || "4") - 1),
  otpMax: Math.pow(10, parseInt(process.env.OTP_LENGTH || "4")) - 1,
  otpExpireTime: process.env.OTP_EXPIRE_TIME || "600",
  otpMaxRetryAttempts: parseInt(process.env.OTP_MAX_RETRY_ATTEMPTS || "4"),

  smtpFromName: process.env.SMTP_FROM_NAME,
  smtpEmail: process.env.SMTP_EMAIL,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,

  noteTitleMaxLength: process.env.NOTE_TITLE_MAX_LENGTH || "15",
  noteContentMaxLength: process.env.NOTE_CONTENT_MAX_LENGTH || "200",
};

export default config;
