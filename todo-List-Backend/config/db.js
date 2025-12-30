const mongoose = require("mongoose");

async function connectDB() {
    try{
        console.log("Attempting to connect to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/todo-list");
        console.log("Database connected successfully");
    }catch(err){
        console.log("Database connection failed", err.message);
        process.exit(1);
    }   
}

module.exports = connectDB;