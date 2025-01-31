import { body, check, validationResult } from "express-validator";
import config from "../config/config.js";

const validNameCheck = check("name")
  .not()
  .isEmpty()
  .withMessage("Name is required");

const validEmailCheck = check("email")
  .normalizeEmail()
  .isEmail()
  .withMessage("Invalid Email");

const validPasswordCheck = (path) =>
  check(path)
    .isLength({ min: 8, max: 30 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[!@#$%^&*])/)
    .withMessage(
      "Password must contain at least one special character (!@#$%^&*)"
    )
    .matches(/^[A-Za-z\d!@#$%^&*]{8,}$/)
    .withMessage(
      "Password can only contain letters, numbers, and special characters (!@#$%^&*)"
    );

const validOTPCheck = check("otp")
  .isNumeric()
  .not()
  .isEmpty()
  .withMessage("Invalid OTP");

const validTitleCheck = check("title")
  .isLength({ max: config.noteTitleMaxLength })
  .withMessage("Invalid Title");

const validContentCheck = check("content")
  .not()
  .isEmpty()
  .isLength({ max: config.noteContentMaxLength })
  .withMessage("Invalid Content");

const validOrderNumberCheck = (path) =>
  check(path)
    .exists()
    .withMessage("Missing 'order' field")
    .isInt()
    .withMessage("Order must be an integer");

const validateMongoId = (path) =>
  check(path)
    .exists()
    .withMessage(`${path} must contain an '_id' field`)
    .isLength({ min: 24, max: 24 })
    .withMessage("ID must be exactly 24 characters long")
    .matches(/^[a-f\d]{24}$/i)
    .withMessage("ID must be a valid MongoDB ObjectId");

export const validateSignUp = [
  validNameCheck,
  validEmailCheck,
  validPasswordCheck("password"),
];

export const validateLogin = [validEmailCheck, validPasswordCheck("password")];

export const validateForgotPassword = [validEmailCheck];

export const validateResetPassword = [
  validEmailCheck,
  validPasswordCheck("newPassword"),
  validOTPCheck,
];

export const validateNote = [
  validTitleCheck,
  validContentCheck,
  validOrderNumberCheck("order"),
];

export const validateUpdateOrder = [
  body()
    .isArray({ min: 2, max: 2 })
    .withMessage("Request body must be an array with exactly 2 objects"),
  validOrderNumberCheck(".*.order"),
  validateMongoId(".*.id"),
];

export const validateNoteDelete = [validateMongoId("id")];

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}
