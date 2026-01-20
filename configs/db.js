import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://Car_Rental:sonu1234@class1.7gxapzd.mongodb.net/Car_Rental", {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ MongoDB CONNECTED to:", conn.connection.host);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    // Don't exit process, continue with test data
    return null;
  }
};

export default connectDB;