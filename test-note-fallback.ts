import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI!;

async function testNoteFallback() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected!");

    // Dynamic import AFTER dotenv is loaded
    const { default: KylasService } = await import(
      "./src/app/modules/kylas/services/KylasService.js"
    );
    const { ActivityType } = await import(
      "./src/app/modules/kylas/types/KylasTypes.js"
    );

    const kylasService = new KylasService();
    console.log("Kylas enabled:", kylasService.isEnabled());

    const email = "vishal@yopmail.com";
    const userDetails = {
      firstName: "Vishal",
      lastName: "Test",
      email: email,
    };

    console.log("Testing trackActivity with note fallback...");
    await kylasService.trackActivity(
      email,
      ActivityType.CAREER_SHORTLISTED,
      ["test-career-id-1", "test-career-id-2"],
      userDetails
    );

    console.log("Done! Check Kylas for the lead and its notes.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testNoteFallback();
