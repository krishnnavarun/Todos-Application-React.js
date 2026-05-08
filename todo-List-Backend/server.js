require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, disconnectDB } = require('./config/db');

const app = express();

// Middleware
app.use(cors())
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

const DEFAULT_PORT = Number(process.env.PORT) || 3000;

const listenOnPort = (port) => new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve(server));
    server.once('error', (err) => reject(err));
});

const startServer = async (startPort, retries = 4) => {
    await connectDB();

    let port = startPort;
    let remainingRetries = retries;
    let server;

    while (!server) {
        try {
            server = await listenOnPort(port);
            console.log(`Server running on port ${port}`);
        } catch (err) {
            if (err.code === 'EADDRINUSE' && remainingRetries > 0) {
                port += 1;
                remainingRetries -= 1;
                console.warn(`Port is busy. Retrying on ${port}...`);
                continue;
            }

            throw err;
        }
    }

    const shutdown = async () => {
        console.log('Shutting down server...');
        server.close(async () => {
            await disconnectDB();
            process.exit(0);
        });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
};

startServer(DEFAULT_PORT).catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
