import { rateLimit } from "express-rate-limit";
import config from "../config/config.js";

export const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxAttempts,
  skipSuccessfulRequests: config.rateLimitSkipSuccess,
  message: {
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
