import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    // check if database is already connected
    if (mongoose.connection.readyState >= 1) {
      console.log("MongoDB already connected");
      return;
    }
    console.log("MONGO_URI", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "bluetap",
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.log("[connectDB] Error connecting to MongoDB", error?.message);
  }
};

export default connectDB;
