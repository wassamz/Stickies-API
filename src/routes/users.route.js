import express from "express";
import { check, validationResult } from "express-validator";

import usersController from "../controllers/users.controller.js";
import { checkRefreshToken } from "../middlewares/auth.middleware.js";
import { createAccessToken } from "../utils/auth.js";

const router = express.Router();

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  validateRequest,
  usersController.signup
);

router.post(
  "/login",
  [check("email").normalizeEmail().isEmail()],
  validateRequest,
  usersController.login
);

router.post(
  "/forgotPassword",
  [check("email").normalizeEmail().isEmail()],
  validateRequest,
  usersController.forgotPassword
);

router.post(
  "/resetPassword",
  [
    check("email").normalizeEmail().isEmail(),
    check("otp").isNumeric().not().isEmpty(),
    check("newPassword").isLength({ min: 6 })
  ],
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

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export default router;
