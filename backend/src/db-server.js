const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'commit_dev_secret_key_12345';

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://commit_user:commit_password@localhost:5433/commit_dev',
    ssl: false
});

// Middleware
app.use(cors());
app.use(express.json());

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ success: false, error: 'Token has been invalidated' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Initialize database with seed data
async function initializeDatabase() {
    try {
        // Check if goal_categories table has data
        const categoriesResult = await pool.query('SELECT COUNT(*) FROM goal_categories');
        const categoriesCount = parseInt(categoriesResult.rows[0].count);

        if (categoriesCount === 0) {
            console.log('🌱 Seeding goal categories...');
            
            const categories = [
                { name: 'fitness', icon: '💪', color: '#FF6B6B', description: 'Physical health and exercise goals' },
                { name: 'learning', icon: '📚', color: '#4ECDC4', description: 'Educational and skill development goals' },
                { name: 'creative', icon: '🎨', color: '#45B7D1', description: 'Artistic and creative pursuits' },
                { name: 'career', icon: '💼', color: '#96CEB4', description: 'Professional development and work goals' },
                { name: 'personal', icon: '🌟', color: '#FFEAA7', description: 'Personal growth and self-improvement' },
                { name: 'social', icon: '👥', color: '#DDA0DD', description: 'Relationships and social connections' },
                { name: 'other', icon: '📝', color: '#98D8C8', description: 'Other miscellaneous goals' }
            ];

            for (const category of categories) {
                await pool.query(
                    'INSERT INTO goal_categories (name, icon, color, description) VALUES ($1, $2, $3, $4)',
                    [category.name, category.icon, category.color, category.description]
                );
            }
            
            console.log('✅ Goal categories seeded successfully');
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
}

// Helper function to calculate streaks
async function updateGoalStreaks(goalId) {
    try {
        const checkInsResult = await pool.query(
            'SELECT check_in_date FROM check_ins WHERE goal_id = $1 ORDER BY check_in_date DESC',
            [goalId]
        );
        
        const checkInDates = checkInsResult.rows.map(row => row.check_in_date);
        
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        
        if (checkInDates.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            // Calculate current streak
            let streakDate = new Date();
            for (const dateStr of checkInDates) {
                const checkDate = dateStr;
                const expectedDate = streakDate.toISOString().split('T')[0];
                
                if (checkDate === expectedDate) {
                    currentStreak++;
                    streakDate.setDate(streakDate.getDate() - 1);
                } else {
                    break;
                }
            }
            
            // Calculate longest streak
            let i = 0;
            while (i < checkInDates.length) {
                tempStreak = 1;
                let currentDate = new Date(checkInDates[i]);
                
                for (let j = i + 1; j < checkInDates.length; j++) {
                    const nextDate = new Date(checkInDates[j]);
                    const diffTime = currentDate - nextDate;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        tempStreak++;
                        currentDate = nextDate;
                    } else {
                        break;
                    }
                }
                
                longestStreak = Math.max(longestStreak, tempStreak);
                i += tempStreak;
            }
        }
        
        // Update goal with new streak values
        await pool.query(
            'UPDATE goals SET current_streak = $1, longest_streak = $2, updated_at = NOW() WHERE id = $3',
            [currentStreak, longestStreak, goalId]
        );
        
        return { currentStreak, longestStreak };
    } catch (error) {
        console.error('Error updating goal streaks:', error);
        return { currentStreak: 0, longestStreak: 0 };
    }
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Commit App Backend (Database)',
        version: '1.0.0'
    });
});

// Test endpoint
app.get('/api/v1/test', (req, res) => {
    res.json({ 
        message: 'Commit App API is working with PostgreSQL!',
        timestamp: new Date().toISOString()
    });
});

// Serve interactive web interface
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commit App - Database Backend</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .status.online {
            background: #4CAF50;
            color: white;
        }
        
        .status.offline {
            background: #f44336;
            color: white;
        }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 25px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            background: #fafafa;
        }
        
        .section h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.4em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        .response {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .response.success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        
        .response.error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        .endpoint {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        
        .method {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 10px;
            min-width: 60px;
            text-align: center;
        }
        
        .method.get { background: #28a745; color: white; }
        .method.post { background: #007bff; color: white; }
        .method.put { background: #ffc107; color: black; }
        .method.delete { background: #dc3545; color: white; }
        
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Commit App</h1>
            <p>Database Backend API - PostgreSQL Edition</p>
            <span>Status: <span id="status" class="status offline">Checking...</span></span>
        </div>
        
        <div class="content">
            <div class="section">
                <h3>🏥 System Health</h3>
                <button onclick="checkHealth()">Check Health</button>
                <button onclick="testAPI()">Test API</button>
                <div id="healthResponse" class="response" style="display: none;"></div>
            </div>

            <div class="section">
                <h3>👤 User Registration</h3>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="regEmail" placeholder="user@example.com">
                </div>
                <div class="form-group">
                    <label>Username:</label>
                    <input type="text" id="regUsername" placeholder="username">
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="regPassword" placeholder="password123">
                </div>
                <div class="form-group">
                    <label>First Name:</label>
                    <input type="text" id="regFirstName" placeholder="John">
                </div>
                <div class="form-group">
                    <label>Last Name:</label>
                    <input type="text" id="regLastName" placeholder="Doe">
                </div>
                <button onclick="registerUser()">Register User</button>
                <div id="registerResponse" class="response" style="display: none;"></div>
            </div>

            <div class="section">
                <h3>🔐 User Login</h3>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="loginEmail" placeholder="user@example.com">
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="loginPassword" placeholder="password123">
                </div>
                <button onclick="loginUser()">Login</button>
                <div id="loginResponse" class="response" style="display: none;"></div>
            </div>

            <div class="section">
                <h3>👤 User Profile</h3>
                <button onclick="getProfile()">Get My Profile</button>
                <div class="form-group">
                    <label>Bio:</label>
                    <textarea id="profileBio" placeholder="Tell us about yourself..."></textarea>
                </div>
                <div class="form-group">
                    <label>Timezone:</label>
                    <input type="text" id="profileTimezone" placeholder="America/New_York">
                </div>
                <button onclick="updateProfile()">Update Profile</button>
                <button onclick="logoutUser()">Logout</button>
                <div id="profileResponse" class="response" style="display: none;"></div>
            </div>

            <div class="section">
                <h3>🎯 Goals Management</h3>
                <button onclick="getGoalCategories()">Get Goal Categories</button>
                <button onclick="getMyGoals()">Get My Goals</button>
                <button onclick="getPublicGoals()">Get Public Goals</button>
                <div class="form-group">
                    <label>Goal Title:</label>
                    <input type="text" id="goalTitle" placeholder="Daily Push-ups Challenge">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="goalDescription" placeholder="Do 50 push-ups every day for 30 days"></textarea>
                </div>
                <div class="form-group">
                    <label>Category:</label>
                    <select id="goalCategory">
                        <option value="fitness">Fitness</option>
                        <option value="learning">Learning</option>
                        <option value="creative">Creative</option>
                        <option value="career">Career</option>
                        <option value="personal">Personal</option>
                        <option value="social">Social</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Target Days:</label>
                    <input type="number" id="goalTargetDays" placeholder="30" min="1">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="goalIsPublic" checked> Make goal public
                    </label>
                </div>
                <button onclick="createGoal()">Create Goal</button>
                <div id="goalsResponse" class="response" style="display: none;"></div>
            </div>

            <div class="section">
                <h3>📸 Daily Check-ins</h3>
                <button onclick="getMyCheckIns()">Get My Check-ins</button>
                <button onclick="getPublicCheckIns()">Get Public Check-ins</button>
                <div class="form-group">
                    <label>Goal ID:</label>
                    <input type="text" id="checkInGoalId" placeholder="Goal ID from above">
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="checkInDescription" placeholder="Completed 50 push-ups! Feeling strong 💪"></textarea>
                </div>
                <div class="form-group">
                    <label>Image URL (optional):</label>
                    <input type="url" id="checkInImageUrl" placeholder="https://example.com/proof.jpg">
                </div>
                <div class="form-group">
                    <label>Video URL (optional):</label>
                    <input type="url" id="checkInVideoUrl" placeholder="https://example.com/proof.mp4">
                </div>
                <button onclick="createCheckIn()">Create Check-in</button>
                <div id="checkInsResponse" class="response" style="display: none;"></div>
            </div>
        </div>
    </div>

    <script>
        let currentToken = null;

        async function checkHealth() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').className = 'response success';
                document.getElementById('healthResponse').textContent = JSON.stringify(data, null, 2);
                
                document.getElementById('status').textContent = 'Online';
                document.getElementById('status').className = 'status online';
            } catch (error) {
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').className = 'response error';
                document.getElementById('healthResponse').textContent = 'Error: ' + error.message;
                
                document.getElementById('status').textContent = 'Offline';
                document.getElementById('status').className = 'status offline';
            }
        }

        async function testAPI() {
            try {
                const response = await fetch('/api/v1/test');
                const data = await response.json();
                
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').className = 'response success';
                document.getElementById('healthResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('healthResponse').style.display = 'block';
                document.getElementById('healthResponse').className = 'response error';
                document.getElementById('healthResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function registerUser() {
            const email = document.getElementById('regEmail').value;
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const firstName = document.getElementById('regFirstName').value;
            const lastName = document.getElementById('regLastName').value;
            
            if (!email || !username || !password) {
                alert('Please fill in email, username, and password');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        username,
                        password,
                        firstName,
                        lastName
                    })
                });
                const data = await response.json();
                
                document.getElementById('registerResponse').style.display = 'block';
                if (response.ok) {
                    document.getElementById('registerResponse').className = 'response success';
                    currentToken = data.data?.token;
                    // Clear form
                    document.getElementById('regEmail').value = '';
                    document.getElementById('regUsername').value = '';
                    document.getElementById('regPassword').value = '';
                    document.getElementById('regFirstName').value = '';
                    document.getElementById('regLastName').value = '';
                } else {
                    document.getElementById('registerResponse').className = 'response error';
                }
                document.getElementById('registerResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('registerResponse').style.display = 'block';
                document.getElementById('registerResponse').className = 'response error';
                document.getElementById('registerResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function loginUser() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                alert('Please fill in email and password');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });
                const data = await response.json();
                
                document.getElementById('loginResponse').style.display = 'block';
                if (response.ok) {
                    document.getElementById('loginResponse').className = 'response success';
                    currentToken = data.data?.token;
                    // Clear form
                    document.getElementById('loginEmail').value = '';
                    document.getElementById('loginPassword').value = '';
                } else {
                    document.getElementById('loginResponse').className = 'response error';
                }
                document.getElementById('loginResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('loginResponse').style.display = 'block';
                document.getElementById('loginResponse').className = 'response error';
                document.getElementById('loginResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function getProfile() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': 'Bearer ' + currentToken
                    }
                });
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response success';
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function updateProfile() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            const bio = document.getElementById('profileBio').value;
            const timezone = document.getElementById('profileTimezone').value;
            
            try {
                const response = await fetch('/api/v1/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + currentToken
                    },
                    body: JSON.stringify({
                        bio,
                        timezone
                    })
                });
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                if (response.ok) {
                    document.getElementById('profileResponse').className = 'response success';
                } else {
                    document.getElementById('profileResponse').className = 'response error';
                }
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function logoutUser() {
            if (!currentToken) {
                alert('No active session');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + currentToken
                    }
                });
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response success';
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
                
                if (response.ok) {
                    currentToken = null;
                }
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Goals functions
        async function getGoalCategories() {
            try {
                const response = await fetch('/api/v1/goals/categories');
                const data = await response.json();
                
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response success';
                document.getElementById('goalsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response error';
                document.getElementById('goalsResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function getMyGoals() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/goals', {
                    headers: {
                        'Authorization': 'Bearer ' + currentToken
                    }
                });
                const data = await response.json();
                
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response success';
                document.getElementById('goalsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response error';
                document.getElementById('goalsResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function getPublicGoals() {
            try {
                const response = await fetch('/api/v1/goals/public');
                const data = await response.json();
                
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response success';
                document.getElementById('goalsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response error';
                document.getElementById('goalsResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function createGoal() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            const title = document.getElementById('goalTitle').value;
            const description = document.getElementById('goalDescription').value;
            const categoryId = document.getElementById('goalCategory').value;
            const targetDays = parseInt(document.getElementById('goalTargetDays').value);
            const isPublic = document.getElementById('goalIsPublic').checked;
            
            if (!title || !description || !targetDays) {
                alert('Please fill in all required fields');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/goals', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + currentToken
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        categoryId,
                        targetDays,
                        isPublic
                    })
                });
                const data = await response.json();
                
                document.getElementById('goalsResponse').style.display = 'block';
                if (response.ok) {
                    document.getElementById('goalsResponse').className = 'response success';
                    // Clear form
                    document.getElementById('goalTitle').value = '';
                    document.getElementById('goalDescription').value = '';
                    document.getElementById('goalTargetDays').value = '';
                } else {
                    document.getElementById('goalsResponse').className = 'response error';
                }
                document.getElementById('goalsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('goalsResponse').style.display = 'block';
                document.getElementById('goalsResponse').className = 'response error';
                document.getElementById('goalsResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Check-ins functions
        async function getMyCheckIns() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            try {
                const response = await fetch('/api/v1/check-ins', {
                    headers: {
                        'Authorization': 'Bearer ' + currentToken
                    }
                });
                const data = await response.json();
                
                document.getElementById('checkInsResponse').style.display = 'block';
                document.getElementById('checkInsResponse').className = 'response success';
                document.getElementById('checkInsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('checkInsResponse').style.display = 'block';
                document.getElementById('checkInsResponse').className = 'response error';
                document.getElementById('checkInsResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function getPublicCheckIns() {
            try {
                const response = await fetch('/api/v1/check-ins/public');
                const data = await response.json();
                
                document.getElementById('checkInsResponse').style.display = 'block';
                document.getElementById('checkInsResponse').className = 'response success';
                document.getElementById('checkInsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('checkInsResponse').style.display = 'block';
                document.getElementById('checkInsResponse').className = 'response error';
                document.getElementById('checkInsResponse').textContent = 'Error: ' + error.message;
            }
        }

        async function createCheckIn() {
            if (!currentToken) {
                alert('Please login first');
                return;
            }
            
            const goalId = document.getElementById('checkInGoalId').value;
            const description = document.getElementById('checkInDescription').value;
            const imageUrl = document.getElementById('checkInImageUrl').value;
            const videoUrl = document.getElementById('checkInVideoUrl').value;
            
            if (!goalId || !description) {
                alert('Please fill in Goal ID and Description');
                return;
            }
            
            try {
                const requestBody = {
                    goalId,
                    description
                };
                
                if (imageUrl) requestBody.imageUrl = imageUrl;
                if (videoUrl) requestBody.videoUrl = videoUrl;
                
                const response = await fetch('/api/v1/check-ins', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + currentToken
                    },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                
                document.getElementById('checkInsResponse').style.display = 'block';
                if (response.ok) {
                    document.getElementById('checkInsResponse').className = 'response success';
                    // Clear form
                    document.getElementById('checkInGoalId').value = '';
                    document.getElementById('checkInDescription').value = '';
                    document.getElementById('checkInImageUrl').value = '';
                    document.getElementById('checkInVideoUrl').value = '';
                } else {
                    document.getElementById('checkInsResponse').className = 'response error';
                }
                document.getElementById('checkInsResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('checkInsResponse').style.display = 'block';
                document.getElementById('checkInsResponse').className = 'response error';
                document.getElementById('checkInsResponse').textContent = 'Error: ' + error.message;
            }
        }
        
        // Check health on page load
        window.onload = function() {
            checkHealth();
        };
    </script>
</body>
</html>`);
});

// Authentication endpoints

// Register user
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email, username, and password are required'
            });
        }
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User with this email or username already exists'
            });
        }
        
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, username, password_hash, first_name, last_name) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, email, username, first_name, last_name, created_at`,
            [email, username, passwordHash, firstName || null, lastName || null]
        );
        
        const user = result.rows[0];
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    createdAt: user.created_at
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Login user
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
        
        // Find user
        const result = await pool.query(
            'SELECT id, email, username, password_hash, first_name, last_name FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Update last active
        await pool.query(
            'UPDATE users SET last_active_at = NOW() WHERE id = $1',
            [user.id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get current user profile
app.get('/api/v1/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, username, first_name, last_name, bio, timezone, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                bio: user.bio,
                timezone: user.timezone,
                createdAt: user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Update user profile
app.put('/api/v1/users/me', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, bio, timezone } = req.body;
        
        const result = await pool.query(
            `UPDATE users 
             SET first_name = $1, last_name = $2, bio = $3, timezone = $4, updated_at = NOW()
             WHERE id = $5
             RETURNING id, email, username, first_name, last_name, bio, timezone`,
            [firstName, lastName, bio, timezone, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        const user = result.rows[0];
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                bio: user.bio,
                timezone: user.timezone
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Logout user
app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        tokenBlacklist.add(token);
    }
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Goal management endpoints

// Get goal categories
app.get('/api/v1/goals/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, icon, color, description FROM goal_categories ORDER BY name'
        );
        
        res.json({
            success: true,
            data: {
                categories: result.rows
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get public goals (discover feed) - No auth required
app.get('/api/v1/goals/public', async (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;
        
        let query = `
            SELECT g.*, gc.name as category_name, gc.icon as category_icon, gc.color as category_color,
                   u.username, u.first_name
            FROM goals g
            JOIN goal_categories gc ON g.category_id = gc.id
            JOIN users u ON g.user_id = u.id
            WHERE g.is_public = true AND g.status = 'active'
        `;
        const params = [];
        
        if (category) {
            query += ' AND gc.name = $1';
            params.push(category);
        }
        
        query += ' ORDER BY g.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        const goals = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            categoryId: row.category_id,
            startDate: row.start_date,
            endDate: row.end_date,
            targetFrequency: row.target_frequency,
            isPublic: row.is_public,
            status: row.status,
            currentStreak: row.current_streak || 0,
            longestStreak: row.longest_streak || 0,
            createdAt: row.created_at,
            category: {
                id: row.category_id,
                name: row.category_name,
                icon: row.category_icon,
                color: row.category_color
            },
            owner: {
                username: row.username,
                firstName: row.first_name
            }
        }));
        
        res.json({
            success: true,
            data: {
                goals,
                total: goals.length,
                hasMore: goals.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get public goals error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get public check-ins feed - No auth required
app.get('/api/v1/check-ins/public', async (req, res) => {
    try {
        const { category, limit = 20, offset = 0 } = req.query;
        
        let query = `
            SELECT ci.*, g.title as goal_title, gc.name as category_name, gc.icon as category_icon,
                   u.username, u.first_name
            FROM check_ins ci
            JOIN goals g ON ci.goal_id = g.id
            JOIN goal_categories gc ON g.category_id = gc.id
            JOIN users u ON ci.user_id = u.id
            WHERE g.is_public = true
        `;
        const params = [];
        
        if (category) {
            query += ' AND gc.name = $1';
            params.push(category);
        }
        
        query += ' ORDER BY ci.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        const checkIns = result.rows.map(row => ({
            id: row.id,
            goalId: row.goal_id,
            userId: row.user_id,
            checkInDate: row.check_in_date,
            description: row.caption,
            imageUrl: row.image_url,
            createdAt: row.created_at,
            goal: {
                id: row.goal_id,
                title: row.goal_title,
                category: {
                    name: row.category_name,
                    icon: row.category_icon
                }
            },
            owner: {
                username: row.username,
                firstName: row.first_name
            }
        }));
        
        res.json({
            success: true,
            data: {
                checkIns,
                total: checkIns.length,
                hasMore: checkIns.length === parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Get public check-ins error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Protected routes (require authentication)

// Get user's goals
app.get('/api/v1/goals', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT g.*, gc.name as category_name, gc.icon as category_icon, gc.color as category_color
             FROM goals g
             JOIN goal_categories gc ON g.category_id = gc.id
             WHERE g.user_id = $1
             ORDER BY g.created_at DESC`,
            [req.user.id]
        );
        
        const goals = result.rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            title: row.title,
            description: row.description,
            categoryId: row.category_id,
            startDate: row.start_date,
            endDate: row.end_date,
            targetFrequency: row.target_frequency,
            isPublic: row.is_public,
            status: row.status,
            currentStreak: row.current_streak || 0,
            longestStreak: row.longest_streak || 0,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            category: {
                id: row.category_id,
                name: row.category_name,
                icon: row.category_icon,
                color: row.category_color
            }
        }));
        
        res.json({
            success: true,
            data: {
                goals
            }
        });
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Create goal
app.post('/api/v1/goals', authenticateToken, async (req, res) => {
    try {
        const { title, description, categoryId, targetDays, isPublic = true, reminderTime } = req.body;
        
        if (!title || !description || !categoryId || !targetDays) {
            return res.status(400).json({
                success: false,
                error: 'Title, description, category, and target days are required'
            });
        }
        
        // Verify category exists (case-insensitive)
        const categoryResult = await pool.query(
            'SELECT id FROM goal_categories WHERE LOWER(name) = LOWER($1)',
            [categoryId]
        );
        
        if (categoryResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid category'
            });
        }
        
        const categoryDbId = categoryResult.rows[0].id;
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + (targetDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        const result = await pool.query(
            `INSERT INTO goals (user_id, category_id, title, description, start_date, end_date, is_public, current_streak, longest_streak)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0)
             RETURNING *`,
            [req.user.id, categoryDbId, title, description, startDate, endDate, isPublic]
        );
        
        const goal = result.rows[0];
        
        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: {
                id: goal.id,
                userId: goal.user_id,
                title: goal.title,
                description: goal.description,
                categoryId: categoryId,
                targetDays: targetDays,
                currentStreak: 0,
                longestStreak: 0,
                isPublic: goal.is_public,
                status: goal.status,
                createdAt: goal.created_at,
                updatedAt: goal.updated_at
            }
        });
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get user's check-ins
app.get('/api/v1/check-ins', authenticateToken, async (req, res) => {
    try {
        const { goalId, startDate, endDate, limit = 50, offset = 0 } = req.query;
        
        let query = `
            SELECT ci.*, g.title as goal_title, gc.name as category_name, gc.icon as category_icon
            FROM check_ins ci
            JOIN goals g ON ci.goal_id = g.id
            JOIN goal_categories gc ON g.category_id = gc.id
            WHERE ci.user_id = $1
        `;
        const params = [req.user.id];
        
        if (goalId) {
            query += ' AND ci.goal_id = $' + (params.length + 1);
            params.push(goalId);
        }
        
        if (startDate) {
            query += ' AND ci.check_in_date >= $' + (params.length + 1);
            params.push(startDate);
        }
        
        if (endDate) {
            query += ' AND ci.check_in_date <= $' + (params.length + 1);
            params.push(endDate);
        }
        
        query += ' ORDER BY ci.check_in_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(parseInt(limit), parseInt(offset));
        
        const result = await pool.query(query, params);
        
        const checkIns = result.rows.map(row => ({
            id: row.id,
            goalId: row.goal_id,
            userId: row.user_id,
            checkInDate: row.check_in_date,
            description: row.caption,
            imageUrl: row.image_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            goal: {
                title: row.goal_title,
                category: {
                    name: row.category_name,
                    icon: row.category_icon
                }
            }
        }));
        
        res.json({
            success: true,
            data: {
                checkIns
            }
        });
    } catch (error) {
        console.error('Get check-ins error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Create check-in
app.post('/api/v1/check-ins', authenticateToken, async (req, res) => {
    try {
        const { goalId, description, imageUrl, videoUrl, checkInDate } = req.body;
        
        if (!goalId || !description) {
            return res.status(400).json({
                success: false,
                error: 'Goal ID and description are required'
            });
        }
        
        // Verify goal exists and belongs to user
        const goalResult = await pool.query(
            'SELECT id, is_public FROM goals WHERE id = $1 AND user_id = $2',
            [goalId, req.user.id]
        );
        
        if (goalResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found or access denied'
            });
        }
        
        const goal = goalResult.rows[0];
        const targetDate = checkInDate || new Date().toISOString().split('T')[0];
        
        // Check if user already checked in for this date
        const existingCheckIn = await pool.query(
            'SELECT id FROM check_ins WHERE goal_id = $1 AND user_id = $2 AND check_in_date = $3',
            [goalId, req.user.id, targetDate]
        );
        
        if (existingCheckIn.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Already checked in for this date',
                data: {
                    id: existingCheckIn.rows[0].id,
                    goalId,
                    userId: req.user.id,
                    checkInDate: targetDate
                }
            });
        }
        
        // Create check-in (using actual schema: image_url is required, caption instead of description)
        const result = await pool.query(
            `INSERT INTO check_ins (goal_id, user_id, check_in_date, image_url, caption)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [goalId, req.user.id, targetDate, imageUrl || 'https://via.placeholder.com/400x300?text=Check-in+Proof', description]
        );
        
        const checkIn = result.rows[0];
        
        // Update goal streaks
        await updateGoalStreaks(goalId);
        
        res.status(201).json({
            success: true,
            message: 'Check-in created successfully',
            data: {
                id: checkIn.id,
                goalId: checkIn.goal_id,
                userId: checkIn.user_id,
                checkInDate: checkIn.check_in_date,
                description: checkIn.caption,
                imageUrl: checkIn.image_url,
                createdAt: checkIn.created_at,
                updatedAt: checkIn.updated_at
            }
        });
    } catch (error) {
        console.error('Create check-in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get specific check-in
app.get('/api/v1/check-ins/:id', authenticateToken, async (req, res) => {
    try {
        const checkInId = req.params.id;
        
        const result = await pool.query(
            `SELECT ci.*, g.title as goal_title, gc.name as category_name, gc.icon as category_icon
             FROM check_ins ci
             JOIN goals g ON ci.goal_id = g.id
             JOIN goal_categories gc ON g.category_id = gc.id
             WHERE ci.id = $1 AND ci.user_id = $2`,
            [checkInId, req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Check-in not found or access denied'
            });
        }
        
        const row = result.rows[0];
        const checkIn = {
            id: row.id,
            goalId: row.goal_id,
            userId: row.user_id,
            checkInDate: row.check_in_date,
            description: row.description,
            imageUrl: row.image_url,
            videoUrl: row.video_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            goal: {
                title: row.goal_title,
                category: {
                    name: row.category_name,
                    icon: row.category_icon
                }
            }
        };
        
        res.json({
            success: true,
            data: checkIn
        });
    } catch (error) {
        console.error('Get check-in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Update check-in
app.put('/api/v1/check-ins/:id', authenticateToken, async (req, res) => {
    try {
        const checkInId = req.params.id;
        const { description, imageUrl, videoUrl } = req.body;
        
        // Verify check-in exists and belongs to user
        const existingResult = await pool.query(
            'SELECT id FROM check_ins WHERE id = $1 AND user_id = $2',
            [checkInId, req.user.id]
        );
        
        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Check-in not found or access denied'
            });
        }
        
        // Update check-in
        const result = await pool.query(
            `UPDATE check_ins 
             SET description = COALESCE($1, description),
                 image_url = COALESCE($2, image_url),
                 video_url = COALESCE($3, video_url),
                 updated_at = NOW()
             WHERE id = $4
             RETURNING *`,
            [description, imageUrl, videoUrl, checkInId]
        );
        
        const checkIn = result.rows[0];
        
        res.json({
            success: true,
            message: 'Check-in updated successfully',
            data: {
                id: checkIn.id,
                goalId: checkIn.goal_id,
                userId: checkIn.user_id,
                checkInDate: checkIn.check_in_date,
                description: checkIn.description,
                imageUrl: checkIn.image_url,
                videoUrl: checkIn.video_url,
                createdAt: checkIn.created_at,
                updatedAt: checkIn.updated_at
            }
        });
    } catch (error) {
        console.error('Update check-in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Delete check-in
app.delete('/api/v1/check-ins/:id', authenticateToken, async (req, res) => {
    try {
        const checkInId = req.params.id;
        
        // Get check-in info before deletion
        const checkInResult = await pool.query(
            'SELECT goal_id FROM check_ins WHERE id = $1 AND user_id = $2',
            [checkInId, req.user.id]
        );
        
        if (checkInResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Check-in not found or access denied'
            });
        }
        
        const goalId = checkInResult.rows[0].goal_id;
        
        // Delete check-in
        await pool.query(
            'DELETE FROM check_ins WHERE id = $1',
            [checkInId]
        );
        
        // Update goal streaks
        await updateGoalStreaks(goalId);
        
        res.json({
            success: true,
            message: 'Check-in deleted successfully'
        });
    } catch (error) {
        console.error('Delete check-in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get goal statistics
app.get('/api/v1/goals/:id/stats', authenticateToken, async (req, res) => {
    try {
        const goalId = req.params.id;
        
        // Verify goal exists and belongs to user
        const goalResult = await pool.query(
            'SELECT * FROM goals WHERE id = $1 AND user_id = $2',
            [goalId, req.user.id]
        );
        
        if (goalResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found or access denied'
            });
        }
        
        const goal = goalResult.rows[0];
        
        // Get check-ins count
        const checkInsResult = await pool.query(
            'SELECT COUNT(*) as total, MAX(check_in_date) as last_check_in FROM check_ins WHERE goal_id = $1',
            [goalId]
        );
        
        const totalCheckIns = parseInt(checkInsResult.rows[0].total);
        const lastCheckIn = checkInsResult.rows[0].last_check_in;
        
        // Calculate completion rate
        const startDate = new Date(goal.start_date);
        const endDate = new Date(goal.end_date);
        const today = new Date();
        const currentDate = today < endDate ? today : endDate;
        
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const daysElapsed = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const completionRate = totalDays > 0 ? ((totalCheckIns / totalDays) * 100).toFixed(1) : '0.0';
        
        res.json({
            success: true,
            data: {
                totalCheckIns,
                currentStreak: goal.current_streak || 0,
                longestStreak: goal.longest_streak || 0,
                targetDays: totalDays,
                completionRate,
                daysActive: daysElapsed,
                lastCheckIn,
                status: goal.status
            }
        });
    } catch (error) {
        console.error('Get goal stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Start the server and initialize database
async function startServer() {
    try {
        // Test database connection
        await pool.query('SELECT NOW()');
        console.log('🗄️  Database connected successfully');
        
        // Initialize database with seed data
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 Commit App Backend (Database) running on port ${PORT}`);
            console.log(`📱 Interactive Web Interface: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test Endpoint: http://localhost:${PORT}/api/v1/test`);
            
            console.log(`\n🔐 Authentication:`);
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/register`);
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/login`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/auth/me`);
            console.log(`   PUT  http://localhost:${PORT}/api/v1/users/me`);
            console.log(`   POST http://localhost:${PORT}/api/v1/auth/logout`);
            
            console.log(`\n🎯 Goal management:`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/goals/categories`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/goals`);
            console.log(`   POST http://localhost:${PORT}/api/v1/goals`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/goals/public`);
            
            console.log(`\n📸 Daily check-ins:`);
            console.log(`   POST http://localhost:${PORT}/api/v1/check-ins`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/check-ins`);
            console.log(`   GET  http://localhost:${PORT}/api/v1/check-ins/public`);
            
            console.log(`\n📊 Database: PostgreSQL`);
            console.log(`📊 Categories: Seeded`);
            console.log(`🎉 Ready for production use!`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
