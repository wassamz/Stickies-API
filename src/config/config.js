// config.js
import dotenv from "dotenv";
dotenv.config();

const config = {
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
};

export default config;
