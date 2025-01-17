import jsonwebtoken from "jsonwebtoken";
import config from "../config/config.js";
import logger from "../utils/logger.js";

const { sign, verify } = jsonwebtoken;

export const tokenTypes = {
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
};

const ACCESS_TOKEN_EXPIRATION = config.jwtAccessExpireTime;
const REFRESH_TOKEN_EXPIRATION = config.jwtRefreshExpireTime;
const KEY = config.jwtSecret;

export function createAccessToken(userId) {
  return sign({ userId, type: tokenTypes.ACCESS }, KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  });
}

export function createRefreshToken(userId) {
  return sign({ userId, type: tokenTypes.REFRESH }, KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
}

export function validateJSONToken(token, tokenType) {
  try {
    const decoded = verify(token, KEY);
    if (
      (tokenType === tokenTypes.REFRESH &&
        decoded.type !== tokenTypes.REFRESH) ||
      (tokenType === tokenTypes.ACCESS && decoded.type !== tokenTypes.ACCESS)
    ) {
      logger.error("Token Type is incorrect.");
      throw new Error("Invalid token type");
    }
    return decoded;
  } catch (error) {
    logger.error("Token validation Error: " + error);
    throw new Error("Invalid token type");
  }
}

export default {
  tokenTypes,
  createAccessToken,
  validateJSONToken,
};
