const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/moveit";

  try {
    await mongoose.connect(uri, {
      autoIndex: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;

