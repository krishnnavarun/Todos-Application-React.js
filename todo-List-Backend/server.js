require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: ["https://todos-app-2026-6i1tgf4ap-krishnavaruns-projects.vercel.app", "https://todos-app-frontend-2026-r90atx01e-krishnavaruns-projects.vercel.app", "http://localhost:3001"],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true
}));
app.use(express.json());

// Connect Database
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
