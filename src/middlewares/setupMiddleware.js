import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import config from "../config/config.js";
import notesRouter from "../routes/notes.route.js";
import usersRouter from "../routes/users.route.js";
import logger, { morganFormat } from "../utils/logger.js";
import { authLimiter } from "./rateLimiter.middleware.js";

export function setupMiddleware(app) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  app.set("trust proxy", 1); //  trust the first IP address in the X-Forwarded-For header, which is the client's original IP address.
  app.use(morgan(morganFormat));
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

  logger.info("Allowed Frontend site: " + config.allowedOrigin);

  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, "../public")));
  app.use("/notes", notesRouter);
  app.use("/users", usersRouter);

  // Catch-all route for undefined routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  // Error-handling middleware
  app.use((err, req, res) => {
    logger.error(err); // For debugging, logs the error stack
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  });
}
