import mongoose from "mongoose";

export function gracefulShutdown(server) {
  process.on("SIGTERM", () => {
    console.info("SIGTERM received. Closing server...");
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
      } catch (error) {
        console.error("Error while closing MongoDB connection:", error);
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => {
      console.error("Forcefully shutting down after timeout.");
      process.exit(1);
    }, 10000); // 10 seconds timeout
  });
}
