import express from "express";
import { check } from "express-validator";

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
  usersController.signup
);

router.post("/login", usersController.login);

router.post("/refresh-token", checkRefreshToken, (req, res) => {
  const userId = req.body.userId;
  // Generate new token
  const newAccessToken = createAccessToken(userId);
  res.json({
    accessToken: newAccessToken,
  });
});

export default router;
