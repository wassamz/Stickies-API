import express from "express";
import config from "./config/config.js";
import { setupMiddleware } from "./middlewares/setupMiddleware.js";
import { initializeDatabase } from "./utils/database.js";
import logger from "./utils/logger.js";
import { gracefulShutdown } from "./utils/shutdown.js";

const app = express();

// Middleware setup
setupMiddleware(app);

// Database connection
initializeDatabase();

// Server setup
const port = config.port || 3000;
const host = config.host || "localhost";
const server = app.listen(port, host, () => {
  logger.info(`Server is listening on http://${host}:${port}`);
});

// Error handling for the server
server.on("error", (error) => {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case "EACCES":
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown logic
gracefulShutdown(server);

export default app;
