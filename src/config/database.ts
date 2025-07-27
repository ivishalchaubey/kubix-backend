import mongoose from "mongoose";
import { config } from "./env.js";
import logger from "../utils/logger.js";

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const conn = await mongoose.connect(config.mongoose.url);

      this.isConnected = true;
      logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

      // Connection event handlers
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
    } catch (error) {
      logger.error("❌ Failed to connect to MongoDB:", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("📴 MongoDB disconnected");
    } catch (error) {
      logger.error("❌ Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }

  public isDbConnected(): boolean {
    return this.isConnected;
  }
}

export default Database;
