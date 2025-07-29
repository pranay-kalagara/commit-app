const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Commit Backend is running!',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        docker: true,
        nodeVersion: process.version,
    });
});

// API test endpoint
app.get('/api/v1/test', (req, res) => {
    res.json({
        success: true,
        message: 'Commit API is working!',
        features: [
            'User Authentication',
            'Goal Management', 
            'Daily Check-ins',
            'Social Features',
            'Progress Replays (Coming Soon)'
        ],
        docker: true,
        nodeVersion: process.version,
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: `Route ${req.originalUrl} not found`,
            statusCode: 404,
        },
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Commit Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/v1/test`);
});

module.exports = app;
