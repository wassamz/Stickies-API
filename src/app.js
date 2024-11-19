import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";
import config from "./config/config.js";
import { authLimiter } from "./middlewares/rateLimiter.middleware.js";
import notesRouter from "./routes/notes.route.js";
import usersRouter from "./routes/users.route.js";
import { initializeDatabase } from "./utils/database.js"; // Hypothetical utility for database connection
import { gracefulShutdown } from "./utils/shutdown.js"; // Hypothetical utility for graceful shutdown

const app = express();

// Middleware setup
function setupMiddleware(app) {
  app.use(logger("common"));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authLimiter);

  const corsOptions = {
    origin: config.allowedOrigin,
    methods: "GET,POST,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    exposedHeaders: "Authorization",
    credentials: true, // Allow cookies to be sent
  };
  app.use(cors(corsOptions));

  console.log("Allowed Frontend site: " + config.allowedOrigin);

  app.use(express.static("public"));
  app.use("/notes", notesRouter);
  app.use("/users", usersRouter);

  // Catch-all route for undefined routes
  app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });

  // Error-handling middleware
  app.use((err, req, res) => {
    console.error(err); // For debugging, logs the error stack
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });
}

setupMiddleware(app);

// Database connection
initializeDatabase();

// Server setup
const port = config.port || 3000;
const host = config.host || "localhost";
const server = app.listen(port, host, () => {
  console.log(`Server is listening on http://${host}:${port}`);
});

// Error handling for the server
server.on("error", (error) => {
  if (error.syscall !== "listen") throw error;
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Graceful shutdown logic
gracefulShutdown(server);

export default app;
