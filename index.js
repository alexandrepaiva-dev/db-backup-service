import cron from "node-cron";
import dotenv from "dotenv";
import { backupDatabase } from "./src/backupDatabase.js";

// Load environment variables from .env file
dotenv.config();

// Retrieve the scheduling string from environment variables
const cronSchedule = process.env.CRON_SCHEDULE || "0 0 * * *"; // Default to daily at midnight if not specified

cron.schedule(
  cronSchedule,
  async () => {
    console.log("Running scheduled backup...");
    const startTime = new Date(); // Record start time
    try {
      await backupDatabase();
      const endTime = new Date(); // Record end time
      const duration = (endTime - startTime) / 1000; // Duration in seconds
      console.log(`Backup process complete. Duration: ${duration} seconds.`);
    } catch (error) {
      console.error("Backup process failed:", error);
    }
  },
  {
    scheduled: true,
    timezone: process.env.TIMEZONE, // Ensure to adjust or remove this based on your actual needs
  }
);
