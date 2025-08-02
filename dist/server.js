import { config, Database } from "./app/config/index.js";
import app from "./app.js";
import logger from "./app/utils/logger.js";
const PORT = config.port;
const startServer = async () => {
    try {
        const database = Database.getInstance();
        await database.connect();
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server is running on http://localhost:${PORT}`);
            logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/health`);
            logger.info(`🌍 Environment: ${config.env}`);
        });
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Starting graceful shutdown...`);
            server.close(async () => {
                logger.info("HTTP server closed.");
                try {
                    await database.disconnect();
                    logger.info("Database connection closed.");
                    process.exit(0);
                }
                catch (error) {
                    logger.error("Error during database disconnect:", error);
                    process.exit(1);
                }
            });
        };
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
    catch (error) {
        logger.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});
process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map