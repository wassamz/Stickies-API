import express from "express";
import usersController from "../controllers/users.controller.js";
import { checkRefreshToken } from "../middlewares/auth.middleware.js";
import {
  validateLogin,
  validatePassword,
  validateRequest,
  validateResetPassword,
  validateSignUp,
} from "../utils/requestValidators.js";

const router = express.Router();

router.post("/signup", validateSignUp, validateRequest, usersController.signup);

router.post("/login", validateLogin, validateRequest, usersController.login);

router.post(
  "/checkEmail",
  validatePassword,
  validateRequest,
  usersController.checkEmail
);

router.post(
  "/forgotPassword",
  validatePassword,
  validateRequest,
  usersController.forgotPassword
);

router.post(
  "/resetPassword",
  validateResetPassword,
  validateRequest,
  usersController.resetPassword
);

router.post("/refresh-token", checkRefreshToken, usersController.refreshToken);

export default router;
