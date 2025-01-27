import { validationResult } from "express-validator";
import config from "../config/config.js";
import usersService from "../services/users.service.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.js";
import ms from "ms"; //utility function to convert string to milliseconds
import logger from "../utils/logger.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeenv === "production", // Set Secure flag only in production
  sameSite: "Strict", // CSRF protection
  maxAge: ms(config.jwtRefreshExpireTime), // Cookie expiration in milliseconds
};

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.info(errors.array());
      return res.status(500).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const userExists = await usersService.getUser(email);
    if (userExists) return res.status(422).json("User already exists");
    const createdUser = await usersService.saveUser(req.body);

    // Generate access and refresh tokens
    const accessToken = createAccessToken(createdUser._id);
    const refreshToken = createRefreshToken(createdUser._id);

    // Set the refresh token in HttpOnly cookie and send the access token in the response
    res
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201) // Status code for successful resource creation
      .json({
        message: "User created.",
        accessToken: accessToken, // Send the access token in the response body
      });
  } catch (error) {
    logger.error("Unable to sign up user: ", error);
    next(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide both email and password.",
    });
  }

  const validCredential = await usersService.validateUser(email, password);

  if (!validCredential) {
    //Could not identify user, credentials seem to be wrong.
    return res.status(401).json({
      error: "Could not identify user, credentials seem to be wrong.",
    });
  }

  const accessToken = createAccessToken(validCredential._id);
  const refreshToken = createRefreshToken(validCredential._id);

  // Set the refresh token in HttpOnly cookie and send the access token in the response
  res
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(200) // Status code for successful login
    .json({
      message: "Login successful",
      accessToken: accessToken, // Send access token in the response body
    });
};

const forgotPassword = async (req, res) => {
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

export default { signup, login, forgotPassword, resetPassword };
