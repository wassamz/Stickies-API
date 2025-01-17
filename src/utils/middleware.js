import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import morgan from "morgan";

import config from "../config/config.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";
import notesRouter from "../routes/notes.route.js";
import usersRouter from "../routes/users.route.js";
import logger from "./logger.js";

// Define a custom format string that includes the timestamp
morgan.token('timestamp', () => new Date().toISOString());
const customFormat = ':timestamp :method :url :status :res[content-length] - :response-time ms';



export function setupMiddleware(app) {
    app.use(morgan(customFormat));
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
    app.use(express.static("public"));
    app.use("/notes", notesRouter);
    app.use("/users", usersRouter);
  
    // Catch-all route for undefined routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
  
    // Error-handling middleware
    app.use((err, req, res, next) => {
      logger.error(err); // For debugging, logs the error stack
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
      });
    });
  }