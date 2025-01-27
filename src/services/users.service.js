import crypto from "crypto";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import config from "../config/config.js";
import { sendOTPEmail } from "./email.service.js";
import logger from "../utils/logger.js";

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
    logger.error("Unable to find user: ", error);
    return null;
  }
}

async function validateUser(email, password) {
  logger.debug("User Validate: " + email);
  try {
    let user = await User.findOne({ email: email });
    if (!user) return null;

    let isMatch = await user.comparePassword(password);
    logger.debug("User Validate: " + isMatch);
    return isMatch ? user : null;
  } catch (error) {
    logger.error("Unable to validate user: ", error);
    return null;
  }
}
async function forgotPassword(email) {
  logger.debug("forgotPassword: " + email);

  const user = await getUser(email);

  if (!user) return null; //no user found

  //check if OTP has recently been attempted
  let otpData = await OTP.findOne({ userId: user._id });
  if (otpData) {
    if (otpData.retries >= config.pwdMaxForgetRetryAttempts) {
      logger.error("Maximum retry attempts exceeded for user: " + email);
      return null; //maximum retry attempts exceeded
    } else {
      otpData.retries = otpData.retries + 1;
      await otpData.save();
      logger.info(
        `Resending OTP ${otpData.otp} and updating retry count: ${otpData.retries}`
      );
      //resend OTP email notification
      await sendOTPEmail(email, otpData.otp);
    }
  } else {
    //generate 4 digit one time password using cryptographically secure random number generator
    const otp = crypto.randomInt(1000, 9999);
    //a new OTP record is created
    otpData = new OTP({
      userId: user._id,
      email: email,
      otp: otp,
      retries: 1,
    });
    otpData = await otpData.save();
    logger.info("Saving new OTP Data: ", JSON.stringify(otpData));
    //send OTP to email
    await sendOTPEmail(email, otp);
  }

  logger.info(`Sending OTP ${otpData.otp} to email: ${email}`);
  return { message: "OTP Forgot Password proccessed successfully" };
}

async function resetPassword(email, newPassword, otp) {
  logger.debug(`resetPassword: ${email} OTP: ${otp}`);
  
  let user = await getUser(email);
  logger.debug(`resetPassword-getUser: ${JSON.stringify(user)}`);
  if (!user) return null; //no user found

  let otpData = await OTP.findOne({ userId: user._id });
  logger.debug(`resetPassword-getUserOTP: ${JSON.stringify(otpData)}`);
  if (!otpData) return null; //OTP not found
  
  otp = parseInt(otp);
  
  //check OTP retry attempts and if OTP doesn't match
  if (
    otpData.retries >= config.pwdMaxForgetRetryAttempts ||
    otpData.otp !== otp
  ) {
    otpData.retries = otpData.retries + 1;
    otpData.save();
    logger.error(`Invalid OTP: ${otp} Retry Count: ${otpData.retries}`);
    return null; //invalid OTP
  }
  logger.info(` OTP: ${otp} OTPData: ${otpData.otp}`);

  if (otpData.otp === otp) {
    //update user password
    user.password = newPassword;
    await user.save();
    logger.info("Updating User Password: " + email);

    //delete OTP record
    await OTP.findByIdAndDelete(otpData._id);
    return { message: "OTP Reset Password proccessed successfully" };
  }
  return null;
}

export default {
  saveUser,
  getUser,
  validateUser,
  forgotPassword,
  resetPassword,
};
