import { model, Schema, SchemaTypes } from "mongoose";
import config from "../config/config.js";
const defaultExpiration = 600; // 10 minutes

const OTPSchema = new Schema(
  {
    userId: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: true,
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
  { expireAfterSeconds: parseInt(config.pwdResetOTPExpireTime) || defaultExpiration }
);

const OTP = model("OTP", OTPSchema);

// Force index creation
OTP.syncIndexes()
  .then(() => console.log("Indexes created"))
  .catch((err) => console.error("Error creating indexes", err));

export default OTP;
