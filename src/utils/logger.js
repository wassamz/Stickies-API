import { createLogger, format, transports } from "winston";
import config from "../config/config.js";

const Level = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug",
};

export const getLoggingLevel = () => config.logLevel;
export const isDebugEnabled = () => config.logLevel === Level.DEBUG;

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

// Customized HTTP Request logging for Morgan module
export const morganFormat = (tokens, req, res) => {
  const status = tokens.status(req, res);
  const logMessage = [
    tokens.method(req, res),
    tokens.url(req, res),
    status,
    tokens.res(req, res, "content-length"),
    "-",
    tokens["response-time"](req, res),
    "ms",
  ].join(" ");

  // Log to appropriate logger method based on status code
  if (status >= 400) {
    logger.error(logMessage);
  } else {
    logger.info(logMessage);
  }

  return null; // Return null to prevent morgan from logging to the console
};

export default logger;
