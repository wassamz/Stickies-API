import { validationResult } from "express-validator";
import config from "../config/config.js";
import usersService from "../services/users.service.js";
import { createAccessToken, createRefreshToken } from "../utils/auth.js";

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
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
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: config.nodeenv === "production", // Set Secure flag only in production
        sameSite: "Strict", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (7 days)
      })
      .status(201)
      .json({
        message: "User created.",
        accessToken: accessToken, // Send the access token in the response body
      });
  } catch (error) {
    console.error("Unable to sign up user: ", error);
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
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // Set Secure flag only in production
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (7 days)
    })
    .status(200) // Status code for successful login
    .json({
      message: "Login successful",
      accessToken: accessToken, // Send access token in the response body
    });
};

export default { signup, login };
