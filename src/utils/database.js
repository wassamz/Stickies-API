import mongoose from "mongoose";
import config from "../config/config.js";
import logger from "./logger.js";

export async function initializeDatabase(retryCount = 0) {
  const mongoURI = `mongodb+srv://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority&appName=${config.dbAppName}`;

  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: config.dbRetryDelay, // Timeout after 5s instead of 30s
    });

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully");
    });

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
      handleConnectionError(error);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected - attempting to reconnect");
      handleReconnection();
    });

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    if (retryCount < config.dbMaxRetries) {
      logger.warn(
        `Failed to connect to MongoDB. Retrying (${retryCount + 1}/${
          config.dbMaxRetries
        }) in ${config.dbRetryDelay / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, config.dbRetryDelay));
      return initializeDatabase(retryCount + 1);
    } else {
      logger.error(
        "Failed to connect to MongoDB after maximum retries. Error:" + error
      );
      throw new Error("Database connection failed");
    }
  }
}

async function handleConnectionError(error) {
  if (mongoose.connection.readyState !== 1) {
    // Not connected
    logger.error(
      "Connection error detected - attempting to reconnect. Error:" + error
    );
    await handleReconnection();
  }
}

async function handleReconnection(retryCount = 0) {
  if (retryCount >= config.dbMaxRetries) {
    logger.error("Failed to reconnect to MongoDB after maximum retries");
    process.exit(1); // Exit the process to allow container/service manager to restart
    return;
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      // Not connected
      await mongoose.connect(mongoose.connection.client.s.url);
      logger.info("Successfully reconnected to MongoDB");
    }
  } catch (error) {
    logger.warn(
      `Reconnection attempt ${retryCount + 1}/${config.dbMaxRetries} failed. Error: ${error}`
    );
    await new Promise((resolve) => setTimeout(resolve, config.dbRetryDelay));
    await handleReconnection(retryCount + 1);
  }
}
