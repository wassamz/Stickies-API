import { tokenTypes, validateJSONToken } from "../utils/auth.js";
import { NotAuthError } from "../utils/errors.js";
import logger from "../utils/logger.js";

export function checkAccessToken(req, res, next) {
  if (req.path === "/users/refresh-token") {
    return next();
  }
  if (req.method === "OPTIONS") {
    return next();
  }
  if (!req.headers.authorization) {
    logger.info("NOT AUTH. AUTH HEADER MISSING.");
    return next(new NotAuthError("Not authenticated."));
  }

  const authFragments = req.headers.authorization.split(" ");
  if (authFragments.length !== 2) {
    logger.info("NOT AUTH. AUTH HEADER INVALID.");
    return next(new NotAuthError("Not authenticated."));
  }
  const authToken = authFragments[1];
  try {
    const validatedToken = validateJSONToken(authToken, tokenTypes.ACCESS);
    req.body.userId = validatedToken.userId; //add decoded user id to request
    logger.info(
      "Authenticated User Making Request userId:" + validatedToken.userId
    );
  } catch (error) {
    logger.error("NOT AUTH. TOKEN INVALID.", error);
    return next(new NotAuthError("Not authenticated."));
  }

  next();
}

export function checkRefreshToken(req, res, next) {
  // Check if refresh token exists in the cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    logger.info("NOT AUTH. REFRESH TOKEN MISSING.");
    return next(new NotAuthError("Not authenticated."));
  }

  try {
    // Validate the refresh token
    const validatedToken = validateJSONToken(refreshToken, tokenTypes.REFRESH);
    req.body.userId = validatedToken.userId; //add decoded user id to request
    logger.info("Refresh Token Valid userId:" + validatedToken.userId);
    next();
  } catch (error) {
    logger.error("NOT AUTH. REFRESH TOKEN INVALID. " + error);
    return next(new NotAuthError("Not authenticated."));
  }
}
