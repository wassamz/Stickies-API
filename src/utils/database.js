import mongoose from "mongoose";
import config from "../config/config.js";
import logger from "./logger.js";

export function initializeDatabase() {
  const mongoURI = `mongodb+srv://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority&appName=${config.dbAppName}`;
  mongoose.connect(mongoURI);

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (error) => {
    logger.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("MongoDB disconnected");
  });

  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    logger.info("MongoDB connection closed due to app termination");
    process.exit(0);
  });
}