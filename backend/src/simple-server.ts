import express from 'express';
import cors from 'cors';

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

// Simple auth test endpoint
app.post('/api/v1/auth/test', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }
    
    return res.json({
        success: true,
        message: 'Authentication endpoint working',
        user: {
            email,
            id: 'test-user-123',
            username: 'testuser'
        },
        token: 'test-jwt-token'
    });
});

// 404 handler
app.use('*', (req, res) => {
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
    console.log(`🔐 Auth test: POST http://localhost:${PORT}/api/v1/auth/test`);
});

export default app;
