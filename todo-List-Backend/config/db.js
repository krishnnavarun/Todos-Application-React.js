const mongoose = require("mongoose");

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/todo-list";

    try {
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(mongoUri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            autoIndex: process.env.NODE_ENV !== "production",
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed:", err.message);
        throw err;
    }
}

async function disconnectDB() {
    await mongoose.connection.close();
}

module.exports = { connectDB, disconnectDB };