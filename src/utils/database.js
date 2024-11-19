import mongoose from "mongoose";
import config from "../config/config.js";

export function initializeDatabase() {
  const mongoURI = `mongodb+srv://${config.dbUser}:${config.dbPassword}@${config.dbHost}/${config.dbName}?retryWrites=true&w=majority&appName=${config.dbAppName}`;
  mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

  mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));
  mongoose.connection.once("open", () => console.info("Connection to Database: OK"));
}
