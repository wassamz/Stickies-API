import crypto from "crypto";
import config from "../config/config.js";
import OTP from "../models/OTP.js";
import User from "../models/User.js";
import logger from "../utils/logger.js";
import { sendOTPEmail } from "./email.service.js";

async function saveUser(userData) {
  try {
    logger.debug("User Create: " + userData?.email);
    let user = new User(userData);
    user = await user.save(); //save will encrypt the password
    return user;
  } catch (error) {
    logger.error("Unable to create user: ", error);
    return { error: "Unable to create user" };
  }
}

async function getUser(email) {
  logger.debug("User Retrieve: " + email);
  try {
    let user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    logger.error("User Retrieve - Unable to find user: ", error);
    return null;
  }
}

async function validateUser(email, password) {
  logger.debug("User Validate: " + email);
  try {
    let user = await User.findOne({ email: email });
    if (!user) return null;

    let isMatch = await user.comparePassword(password);
    logger.debug("User Validate - password match successful: " + email);
    return isMatch ? user : null;
  } catch (error) {
    logger.error("User Validate - Unable to validate user: ", error);
    return null;
  }
}
async function signUp(name, email, password, otp) {
  logger.debug(`User SignUp - name:${name} email:${email} OTP: ${otp}`);
  //check if user exists
  const userExists = await getUser(email);
  if (userExists) return { error: "User already exists" };

  //if OTP invalid, update retry count and return null
  let otpData = await OTP.findOne({ email: email });
  logger.debug(`User SignUp - getUserOTP: ${JSON.stringify(otpData)}`);
  if (!otpData) return { error: "Sign Up Unsuccessful" }; //OTP not found

  otp = parseInt(otp);
  //check OTP retry attempts and if OTP doesn't match
  if (
    otpData.retries >= config.pwdMaxForgetRetryAttempts ||
    otpData.otp !== otp
  ) {
    otpData.retries++;
    otpData.save();
    logger.error(
      `User SignUp - Invalid OTP: ${otp} Retry Count: ${otpData.retries}`
    );
    return { error: "OTP is incorrect" };
  }
  logger.info(` OTP: ${otp} OTPData: ${otpData.otp}`);

  //if OTP valid, create user
  if (otpData.otp === otp) {
    try {
      logger.debug("User SignUp - Create: " + email);
      let user = new User({
        name: name,
        email: email,
        password: password,
      });
      user = await user.save(); //save will encrypt the password
      //delete OTP record
      await OTP.findByIdAndDelete(otpData._id);
      return user;
    } catch (error) {
      logger.error("User SignUp - Unable to create user: ", error);
      return { error: "Unable to create user" };
    }
  }
  return null;
}

async function checkEmail(email) {
  // check if user exists
  logger.debug("checkEmail: " + email);

  //if exists, ask user to login or reset email
  const user = await getUser(email);
  if (user)
    return {
      error: "User already exists. Please login or reset your password.",
    };

  //check if OTP has recently been attempted
  let otpData = await OTP.findOne({ email: email });
  if (otpData) {
    if (otpData.retries >= config.pwdMaxForgetRetryAttempts) {
      logger.error(
        "checkEmail - Maximum retry attempts exceeded for user: " + email
      );
      return {
        error: "Maximum retry attempts exceeded. Please try again later.",
      };
    } else {
      otpData.retries = otpData.retries + 1;
      await otpData.save();
      logger.info(
        `checkEmail - Resending OTP ${otpData.otp} and updating retry count: ${otpData.retries}`
      );
      //resend OTP email notification
      await sendOTPEmail(email, otpData.otp);
    }
  } else {
    //generate 4 digit one time password using cryptographically secure random number generator
    const otp = crypto.randomInt(config.otpMin, config.otpMax);
    //a new OTP record is created
    otpData = new OTP({
      email: email,
      otp: otp,
      retries: 1,
    });
    otpData = await otpData.save();
    logger.info("checkEmail - Saving new OTP Data: ", JSON.stringify(otpData));
    await sendOTPEmail(email, otp);
  }
  logger.info(`checkEmail - Sending OTP ${otpData.otp} to email: ${email}`);

  return { message: "OTP Email Validation sent successfully" };
}
async function forgotPassword(email) {
  logger.debug("forgotPassword: " + email);

  const user = await getUser(email);

  if (!user) return null; //no user found

  //check if OTP has recently been attempted
  let otpData = await OTP.findOne({ userId: user._id });
  if (otpData) {
    if (otpData.retries >= config.pwdMaxForgetRetryAttempts) {
      logger.error(
        "forgotPassword - Maximum retry attempts exceeded for user: " + email
      );
      return null; //maximum retry attempts exceeded
    } else {
      otpData.retries = otpData.retries + 1;
      await otpData.save();
      logger.info(
        `forgotPassword - Resending OTP ${otpData.otp} and updating retry count: ${otpData.retries}`
      );
      //resend OTP email notification
      await sendOTPEmail(email, otpData.otp);
    }
  } else {
    //generate 4 digit one time password using cryptographically secure random number generator
    const otp = crypto.randomInt(config.otpMin, config.otpMax);

    //a new OTP record is created
    otpData = new OTP({
      userId: user._id,
      email: email,
      otp: otp,
      retries: 1,
    });
    otpData = await otpData.save();
    logger.info(
      "forgotPassword - Saving new OTP Data: ",
      JSON.stringify(otpData)
    );
    //send OTP to email
    await sendOTPEmail(email, otp);
  }

  logger.info(`forgotPassword Sending OTP ${otpData.otp} to email: ${email}`);
  return { message: "OTP Forgot Password processed successfully" };
}

async function resetPassword(email, newPassword, otp) {
  logger.debug(`resetPassword - email:${email} OTP: ${otp}`);

  let user = await getUser(email);
  logger.debug(`resetPassword - getUser: ${JSON.stringify(user)}`);
  if (!user) return null; //no user found

  let otpData = await OTP.findOne({ userId: user._id });
  logger.debug(`resetPassword - getUserOTP: ${JSON.stringify(otpData)}`);
  if (!otpData) return null; //OTP not found

  otp = parseInt(otp);

  //check OTP retry attempts and if OTP doesn't match
  if (
    otpData.retries >= config.pwdMaxForgetRetryAttempts ||
    otpData.otp !== otp
  ) {
    otpData.retries = otpData.retries + 1;
    otpData.save();
    logger.error(
      `resetPassword - Invalid OTP: ${otp} Retry Count: ${otpData.retries}`
    );
    return null; //invalid OTP
  }
  logger.info(`resetPassword - OTP: ${otp} OTPData: ${otpData.otp}`);

  if (otpData.otp === otp) {
    //update user password
    user.password = newPassword;
    await user.save();
    logger.info("resetPassword - Updating User Password: " + email);

    //delete OTP record
    await OTP.findByIdAndDelete(otpData._id);
    return { message: "OTP Reset Password processed successfully" };
  }
  return null;
}

export default {
  saveUser,
  signUp,
  getUser,
  checkEmail,
  validateUser,
  forgotPassword,
  resetPassword,
};
