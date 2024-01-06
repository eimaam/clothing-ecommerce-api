import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.MONGO_URI as string;
export const connectMongoDB = async () => {
  try {
    if (!MONGODB_URI) {
        throw new Error('Missing db URI');
      }

    await mongoose.connect(MONGODB_URI);

    console.log('Connected to MongoDB');

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Exit the process if unable to connect
    process.exit(1); 
  }

  // Handle disconnect events
  mongoose.connection.on('disconnected', () => {
    console.log('Disconnected from MongoDB. Reconnecting...');
    connectMongoDB();
  });

  // Handle connection error events
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
};
