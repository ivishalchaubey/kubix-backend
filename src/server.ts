import { config, Database } from "./config/index.js";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = config.port;

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    const database = Database.getInstance();
    await database.connect();

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server is running on http://localhost:${PORT}`);
      logger.info(
        `📚 API Documentation: http://localhost:${PORT}/api/v1/health`
      );
      logger.info(`🌍 Environment: ${config.env}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);

      // Close server
      server.close(async () => {
        logger.info("HTTP server closed.");

        // Close database connection
        try {
          await database.disconnect();
          logger.info("Database connection closed.");
          process.exit(0);
        } catch (error) {
          logger.error("Error during database disconnect:", error);
          process.exit(1);
        }
      });
    };

    // Handle process termination
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: unknown, promise: Promise<any>) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start the server
startServer();
