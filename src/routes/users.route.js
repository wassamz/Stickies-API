import express from "express";
import usersController from "../controllers/users.controller.js";
import { checkRefreshToken } from "../middlewares/auth.middleware.js";
import { createAccessToken } from "../utils/auth.js";
import {
  validateForgotPassword,
  validateLogin,
  validateRequest,
  validateResetPassword,
  validateSignUp,
} from "../utils/requestValidators.js";

const router = express.Router();

router.post("/signup", validateSignUp, validateRequest, usersController.signup);

router.post("/login", validateLogin, validateRequest, usersController.login);

router.post(
  "/forgotPassword",
  validateForgotPassword,
  validateRequest,
  usersController.forgotPassword
);

router.post(
  "/resetPassword",
  validateResetPassword,
  validateRequest,
  usersController.resetPassword
);

router.post("/refresh-token", checkRefreshToken, (req, res) => {
  const userId = req.body.userId;
  // Generate new token
  const newAccessToken = createAccessToken(userId);
  res.json({
    accessToken: newAccessToken,
  });
});

export default router;
