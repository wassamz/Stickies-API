import { createLogger, format, transports } from "winston";
import config from "../config/config.js";

const Level = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

const loggerTransports = [
  new transports.Console(),
  new transports.File({ filename: "app.log", level: Level.INFO }), // Log info level and above to app.log
  new transports.File({ filename: "errors.log", level: Level.ERROR }), // Log error level to errors.log
];

// Conditionally add the debug transport if the logging level is set to debug
if (config.logLevel === Level.DEBUG) {
  loggerTransports.push(
    new transports.File({ filename: "debug.log", level: Level.DEBUG })
  ); // Log debug level and above to debug.log
}

const logger = createLogger({
  level: getLoggingLevel(),
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: loggerTransports,
});

export function getLoggingLevel() {
  return config.logLevel;
}

export function isDebugEnabled() {
  return config.logLevel === Level.DEBUG;
}

export default logger;
