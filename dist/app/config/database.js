import mongoose from "mongoose";
import { config } from "./env.js";
import logger from "../utils/logger.js";
class Database {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            return;
        }
        try {
            const conn = await mongoose.connect(config.mongoose.url, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            });
            this.isConnected = true;
            logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
            mongoose.connection.on("disconnected", () => {
                this.isConnected = false;
                logger.warn("📡 MongoDB disconnected");
            });
            mongoose.connection.on("error", (error) => {
                logger.error("❌ MongoDB connection error:", error);
            });
            mongoose.connection.on("reconnected", () => {
                this.isConnected = true;
                logger.info("🔄 MongoDB reconnected");
            });
        }
        catch (error) {
            logger.error("❌ Failed to connect to MongoDB:", error);
            process.exit(1);
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose.disconnect();
            this.isConnected = false;
            logger.info("📴 MongoDB disconnected");
        }
        catch (error) {
            logger.error("❌ Failed to disconnect from MongoDB:", error);
            throw error;
        }
    }
    isDbConnected() {
        return this.isConnected;
    }
}
export default Database;
//# sourceMappingURL=database.js.map