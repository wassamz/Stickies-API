import { model, Schema, SchemaTypes } from "mongoose";
import config from "../config/config.js";
import logger from "../utils/logger.js";

const defaultExpiration = 600; // 10 minutes

const OTPSchema = new Schema(
  {
    userId: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    otp: {
      type: Number,
      required: true,
    },
    retries: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { autoIndex: true } // Ensure automatic index creation
);

OTPSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: parseInt(config.otpExpireTime) || defaultExpiration }
);

const OTP = model("OTP", OTPSchema);

// Force index creation
OTP.syncIndexes()
  .then(() => logger.info("MongoDB Indexes created for OTP"))
  .catch((err) => logger.error("Error creating MongoDB indexes for OTP", err));

export default OTP;
