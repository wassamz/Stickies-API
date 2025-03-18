import { validationResult } from "express-validator";
import ms from "ms"; //utility function to convert string to milliseconds
import config from "../config/config.js";
import usersService from "../services/users.service.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.js";
import logger from "../utils/logger.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeenv === "production", // Set Secure flag only in production
  sameSite: "Strict", // CSRF protection
  maxAge: ms(config.jwtRefreshExpireTime), // Convert and set cookie expiration in milliseconds
};

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error(errors.array());
      return res.status(500).json({ errors: errors.array() });
    }

    const { name, email, password, otp } = req.body;
    logger.info(`Controller: Sign Up = name:${name} email:${email} otp:${otp}`);
    const result = await usersService.signUp(name, email, password, otp);
    if (result.error) {
      // Different status codes based on error type
      switch (result.error) {
        case "User already exists":
        case "Maximum retry attempts exceeded":
          return res.status(409).json({ error: result.error });
        case "OTP is incorrect":
        case "Sign Up Unsuccessful":
          return res.status(422).json({ error: result.error });
        default:
          return res.status(400).json({ error: result.error });
      }
    }

    // User created successfully
    // Generate access and refresh tokens
    const accessToken = createAccessToken(result._id);
    const refreshToken = createRefreshToken(result._id);

    // Set the refresh token in HttpOnly cookie and send the access token in the response
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201) // Status code for successful resource creation
      .header("Authorization", `Bearer ${accessToken}`)
      .json({
        message: "User created.",
      });
  } catch (error) {
    logger.error("Unable to sign up user: ", error);
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  logger.info("Controller: Login = " + email);
  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide both email and password.",
    });
  }

  const validCredential = await usersService.validateUser(email, password);

  if (validCredential === null) {
    logger.warn(
      "Login Error: Could not identify user, credentials seem to be wrong."
    );

    return res.status(401).json({
      error: "Could not identify user, credentials seem to be wrong.",
    });
  }

  const accessToken = createAccessToken(validCredential._id);
  const refreshToken = createRefreshToken(validCredential._id);

  // Set the refresh token in HttpOnly cookie and send the access token in the response
  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200)
    .header("Authorization", `Bearer ${accessToken}`)
    .json({
      message: "Login successful",
    });
};

const checkEmail = async (req, res) => {
  logger.info("Controller:  Check Email = " + JSON.stringify(req.body));
  const result = await usersService.checkEmail(req.body.email);
  if (result.error) return res.status(403).json(result);
  return res.status(200).json(result);
};

const forgotPassword = async (req, res) => {
  logger.info("Controller: Forgot Password = " + JSON.stringify(req.body));
  const result = await usersService.forgotPassword(req.body.email);
  if (!result)
    return res.status(404).json({ error: "Forgot Password unsuccessful" });
  return res.status(200).json({ message: "OTP sent to email on record." });
};

const resetPassword = async (req, res) => {
  logger.info("Controller: Reset Password = " + JSON.stringify(req.body));
  const { email, newPassword, otp } = req.body;
  const result = await usersService.resetPassword(email, newPassword, otp);
  if (!result)
    return res.status(400).json({ error: "Password Reset unsuccessful" });
  else return res.status(200).json({ message: "Password reset successful." });
};

const refreshToken = async (req, res) => {
  const userId = req.body.userId;
  // Generate new token
  const newAccessToken = createAccessToken(userId);
  res.status(200).header("Authorization", `Bearer ${newAccessToken}`).json({
    message: "new access token generated",
  });
};

const logout = async (req, res) => {
  res.clearCookie("refreshToken").status(200).json({
    message: "User logged out successfully.",
  });
};

export default {
  signup,
  login,
  logout,
  checkEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
};
