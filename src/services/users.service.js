//import { randomInt } from "crypto";
import crypto from "crypto";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import config from "../config/config.js";
import { sendOTPEmail } from "./email.service.js";

async function saveUser(userData) {
  try {
    console.info("User Create: " + userData?.email);
    let user = new User(userData);
    user = await user.save(); //save will encrypt the password
    return user;
  } catch (error) {
    console.error("Unable to create user: ", error);
    return { error: "Unable to create user" };
  }
}

async function getUser(email) {
  console.info("User Retrieve: " + email);
  try {
    let user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    console.error("Unable to find user: ", error);
    return { error: "Unable to find user" };
  }
}

async function validateUser(email, password) {
  console.info("User Validate: " + email);
  try {
    let user = await User.findOne({ email: email });
    if (!user) return null;

    let isMatch = await user.comparePassword(password);
    console.log(JSON.stringify(user) + "password match?" + isMatch);

    return isMatch ? user : null;
  } catch (error) {
    console.error("Unable to validate user: ", error);
    return null;
  }
}
async function forgotPassword(email) {
  console.info("forgotPassword: " + email);

  const user = await getUser(email);

  if (!user) return null; //no user found

  //check if OTP has recently been attempted
  let otpData = await OTP.findOne({ userId: user._id });
  if (otpData) {
    if (otpData.retries >= config.pwdMaxForgetRetryAttempts) {
      console.error("Maximum retry attempts exceeded for user: " + email);
      return null; //maximum retry attempts exceeded
    } else {
      otpData.retries = otpData.retries + 1;
      await otpData.save();
      console.info(
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
    console.info("Saving new OTP Data: ", JSON.stringify(otpData));
    //send OTP to email
    await sendOTPEmail(email, otp);
  }

  console.info(`Sending OTP ${otpData.otp} to email: ${email}`);
  return "Success";
}

async function resetPassword(email, otp, newPassword) {
  console.info(`resetPassword: ${email} OTP: ${otp}`);

  let user = await getUser(email);
  if (!user) return null; //no user found

  let otpData = await OTP.findOne({ userId: user._id });
  if (!otpData) return null; //OTP not found

  //check OTP retry attempts and if OTP doesn't match
  if (
    otpData.retries >= config.pwdMaxForgetRetryAttempts ||
    otpData.otp !== otp
  ) {
    otpData.retries = otpData.retries + 1;
    otpData.save();
    console.error(`Invalid OTP: ${otp} Retry Count: ${otpData.retries}`);
    return null; //invalid OTP
  }
  console.info(` OTP: ${otp} OTPData: ${otpData.otp}`);

  if (otpData.otp === otp) {
    //update user password
    user.password = newPassword;
    await user.save();
    console.info("Updating User Password: ", email);

    //delete OTP record
    await OTP.findByIdAndDelete(otpData._id);
    return "Success";
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
