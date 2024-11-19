import { tokenTypes, validateJSONToken } from "../utils/auth.js";
import { NotAuthError } from "../utils/errors.js";

export function checkAccessToken(req, res, next) {
  if (req.path === "/users/refresh-token") {
    return next();
  }
  if (req.method === "OPTIONS") {
    return next();
  }
  if (!req.headers.authorization) {
    console.log("NOT AUTH. AUTH HEADER MISSING.");
    return next(new NotAuthError("Not authenticated."));
  }

  const authFragments = req.headers.authorization.split(" ");
  if (authFragments.length !== 2) {
    console.log("NOT AUTH. AUTH HEADER INVALID.");
    return next(new NotAuthError("Not authenticated."));
  }
  const authToken = authFragments[1];
  try {
    const validatedToken = validateJSONToken(authToken, tokenTypes.ACCESS);
    req.body.userId = validatedToken.userId; //add decoded user id to request
    console.log(
      "Authenticated User Making Request userId:" + validatedToken.userId
    );
  } catch (error) {
    console.error("NOT AUTH. TOKEN INVALID.", error);
    return next(new NotAuthError("Not authenticated."));
  }

  next();
}

export function checkRefreshToken(req, res, next) {
  // Check if refresh token exists in the cookies
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    console.log("NOT AUTH. REFRESH TOKEN MISSING.");
    return next(new NotAuthError("Not authenticated."));
  }

  try {
    // Validate the refresh token
    const validatedToken = validateJSONToken(refreshToken, tokenTypes.REFRESH);
    req.body.userId = validatedToken.userId; //add decoded user id to request
    console.log("Refresh Token Valid userId:" + validatedToken.userId);
    next();
  } catch (error) {
    console.log("NOT AUTH. REFRESH TOKEN INVALID. " + error);
    return next(new NotAuthError("Not authenticated."));
  }
}
