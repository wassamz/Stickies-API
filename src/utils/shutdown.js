import mongoose from "mongoose";
import logger from "./logger.js";

export function gracefulShutdown(server) {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received. Closing server...");
    server.close(async () => {
      logger.info("HTTP server closed.");
      try {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed.");
      } catch (error) {
        logger.error("Error while closing MongoDB connection:", error);
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => {
      logger.error("Forcefully shutting down after timeout.");
      process.exit(1);
    }, 10000); // 10 seconds timeout
  });
}
