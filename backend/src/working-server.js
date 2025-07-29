const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for demo (will be replaced with database)
const users = new Map();
const goals = new Map();
const goalCategories = new Map();
const checkIns = new Map();
const blacklistedTokens = new Set();

// Initialize default goal categories
const defaultCategories = [
    { id: 'fitness', name: 'Fitness & Health', description: 'Exercise, diet, wellness goals', icon: '💪' },
    { id: 'learning', name: 'Learning & Skills', description: 'Education, coding, new skills', icon: '📚' },
    { id: 'creative', name: 'Creative Projects', description: 'Art, writing, music, design', icon: '🎨' },
    { id: 'career', name: 'Career & Business', description: 'Professional development, work goals', icon: '💼' },
    { id: 'personal', name: 'Personal Development', description: 'Habits, mindfulness, self-improvement', icon: '🌱' },
    { id: 'social', name: 'Social & Relationships', description: 'Family, friends, community', icon: '👥' },
    { id: 'other', name: 'Other', description: 'Custom goals and challenges', icon: '🎯' }
];

defaultCategories.forEach(category => {
    goalCategories.set(category.id, {
        ...category,
        createdAt: new Date().toISOString()
    });
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'commit_dev_secret_key_12345';
const JWT_EXPIRES_IN = '7d';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function to update goal streaks
function updateGoalStreaks(goalId) {
    const goal = goals.get(goalId);
    if (!goal) return;

    const goalCheckIns = Array.from(checkIns.values())
        .filter(checkIn => checkIn.goalId === goalId)
        .sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));

    if (goalCheckIns.length === 0) {
        goal.currentStreak = 0;
        goal.longestStreak = 0;
        goal.totalCheckIns = 0;
        goal.lastCheckInAt = null;
        goals.set(goalId, goal);
        return;
    }

    goal.totalCheckIns = goalCheckIns.length;
    goal.lastCheckInAt = goalCheckIns[0].checkInDate;

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < goalCheckIns.length; i++) {
        const checkInDate = new Date(goalCheckIns[i].checkInDate);
        checkInDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - checkInDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
            currentStreak++;
        } else {
            break;
        }
    }

    goal.currentStreak = currentStreak;

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < goalCheckIns.length; i++) {
        const currentDate = new Date(goalCheckIns[i].checkInDate);
        const previousDate = new Date(goalCheckIns[i-1].checkInDate);
        const daysDiff = Math.floor((previousDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            tempStreak++;
        } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    goal.longestStreak = longestStreak;

    goals.set(goalId, goal);
}

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required'
        });
    }

    if (blacklistedTokens.has(token)) {
        return res.status(401).json({
            success: false,
            error: 'Token has been invalidated'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Root route - serve HTML interface
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commit App - API Testing</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 {
            color: #4c51bf;
            text-align: center;
            margin-bottom: 10px;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            background: #f8fafc;
        }
        .section h3 {
            color: #2d3748;
            margin-top: 0;
        }
        .form-group {
            margin: 15px 0;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #4a5568;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
        }
        button {
            background: #4c51bf;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        button:hover {
            background: #434190;
        }
        .response {
            background: #1a202c;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 15px;
        }
        .success {
            border-left: 4px solid #48bb78;
        }
        .error {
            border-left: 4px solid #f56565;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            margin-left: 10px;
        }
        .status.online {
            background: #c6f6d5;
            color: #22543d;
        }
        .status.offline {
            background: #fed7d7;
            color: #742a2a;
        }
        .endpoint {
            background: #edf2f7;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .method {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            margin-right: 10px;
        }
        .method.get { background: #bee3f8; color: #2a69ac; }
        .method.post { background: #c6f6d5; color: #22543d; }
        .method.put { background: #fbb6ce; color: #97266d; }
        .method.delete { background: #fed7d7; color: #742a2a; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Commit App API</h1>
        <p class="subtitle">Social Accountability Platform - Backend Testing Interface</p>
        
        <div class="section">
            <h3>🔍 System Status <span id="status" class="status offline">Checking...</span></h3>
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
            <button onclick="getAllUsers()">Get All Users (Dev)</button>
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

        <div class="section">
            <h3>📋 Available API Endpoints</h3>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/health</code> - System health check
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/test</code> - API test endpoint
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/v1/auth/register</code> - Register new user
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/v1/auth/login</code> - Login user
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/auth/me</code> - Get current user profile
            </div>
            <div class="endpoint">
                <span class="method put">PUT</span>
                <code>/api/v1/users/me</code> - Update user profile
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/v1/auth/logout</code> - Logout user
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/goals/categories</code> - Get goal categories
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/v1/goals</code> - Create goal
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/goals</code> - Get user's goals
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/goals/public</code> - Get public goals
            </div>
            <div class="endpoint">
                <span class="method post">POST</span>
                <code>/api/v1/check-ins</code> - Create check-in
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/check-ins</code> - Get user's check-ins
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/check-ins/public</code> - Get public check-ins
            </div>
            <div class="endpoint">
                <span class="method get">GET</span>
                <code>/api/v1/dev/users</code> - Get all users (development only)
            </div>
        </div>
    </div>

    <script>
        let currentToken = null;
        const API_BASE = '';

        // Check system health
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

        // Test API endpoint
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

        // Register user
        async function registerUser() {
            const userData = {
                email: document.getElementById('regEmail').value,
                username: document.getElementById('regUsername').value,
                password: document.getElementById('regPassword').value,
                firstName: document.getElementById('regFirstName').value,
                lastName: document.getElementById('regLastName').value
            };

            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const data = await response.json();
                
                document.getElementById('registerResponse').style.display = 'block';
                document.getElementById('registerResponse').className = response.ok ? 'response success' : 'response error';
                document.getElementById('registerResponse').textContent = JSON.stringify(data, null, 2);
                
                if (response.ok && data.data && data.data.token) {
                    currentToken = data.data.token;
                }
            } catch (error) {
                document.getElementById('registerResponse').style.display = 'block';
                document.getElementById('registerResponse').className = 'response error';
                document.getElementById('registerResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Login user
        async function loginUser() {
            const loginData = {
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            };

            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });
                
                const data = await response.json();
                
                document.getElementById('loginResponse').style.display = 'block';
                document.getElementById('loginResponse').className = response.ok ? 'response success' : 'response error';
                document.getElementById('loginResponse').textContent = JSON.stringify(data, null, 2);
                
                if (response.ok && data.data && data.data.token) {
                    currentToken = data.data.token;
                }
            } catch (error) {
                document.getElementById('loginResponse').style.display = 'block';
                document.getElementById('loginResponse').className = 'response error';
                document.getElementById('loginResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Get user profile
        async function getProfile() {
            if (!currentToken) {
                alert('Please login first to get a token');
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/me', {
                    headers: {
                        'Authorization': \`Bearer \${currentToken}\`
                    }
                });
                
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = response.ok ? 'response success' : 'response error';
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Get all users
        async function getAllUsers() {
            try {
                const response = await fetch('/api/v1/dev/users');
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = response.ok ? 'response success' : 'response error';
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Update profile
        async function updateProfile() {
            if (!currentToken) {
                alert('Please login first to get a token');
                return;
            }

            const profileData = {
                bio: document.getElementById('profileBio').value,
                timezone: document.getElementById('profileTimezone').value
            };

            try {
                const response = await fetch('/api/v1/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${currentToken}\`
                    },
                    body: JSON.stringify(profileData)
                });
                
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = response.ok ? 'response success' : 'response error';
                document.getElementById('profileResponse').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = 'response error';
                document.getElementById('profileResponse').textContent = 'Error: ' + error.message;
            }
        }

        // Logout user
        async function logoutUser() {
            if (!currentToken) {
                alert('No active session to logout');
                return;
            }

            try {
                const response = await fetch('/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': \`Bearer \${currentToken}\`
                    }
                });
                
                const data = await response.json();
                
                document.getElementById('profileResponse').style.display = 'block';
                document.getElementById('profileResponse').className = response.ok ? 'response success' : 'response error';
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

        // Goals Management Functions
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

        // Check-ins Management Functions
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
        features: {
            authentication: true,
            database: 'in-memory (demo)',
            jwt: true
        }
    });
});

// API test endpoint
app.get('/api/v1/test', (req, res) => {
    res.json({
        success: true,
        message: 'Commit API is working!',
        features: [
            'User Authentication ✅',
            'Goal Management (Coming Soon)',
            'Daily Check-ins (Coming Soon)',
            'Social Features (Coming Soon)',
            'Progress Replays (Coming Soon)'
        ],
        docker: true,
        nodeVersion: process.version,
        totalUsers: users.size
    });
});

// Authentication Endpoints

// Register new user
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email, username, and password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }

        // Check if user already exists
        for (const [id, user] of users) {
            if (user.email === email.toLowerCase() || user.username === username) {
                return res.status(409).json({
                    success: false,
                    error: 'User with this email or username already exists'
                });
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const userId = uuidv4();
        const user = {
            id: userId,
            email: email.toLowerCase(),
            username,
            passwordHash,
            firstName: firstName || null,
            lastName: lastName || null,
            profileImageUrl: null,
            bio: null,
            timezone: 'UTC',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isActive: true,
            emailVerified: false,
            pushNotificationsEnabled: true
        };

        users.set(userId, user);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return user profile (without password hash)
        const userProfile = {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            bio: user.bio,
            timezone: user.timezone,
            createdAt: user.createdAt,
            lastActiveAt: user.lastActiveAt,
            emailVerified: user.emailVerified,
            pushNotificationsEnabled: user.pushNotificationsEnabled
        };

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: userProfile,
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

        // Find user by email
        let foundUser = null;
        for (const [id, user] of users) {
            if (user.email === email.toLowerCase()) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        if (!foundUser.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Account has been deactivated'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, foundUser.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Update last active timestamp
        foundUser.lastActiveAt = new Date().toISOString();
        users.set(foundUser.id, foundUser);

        // Generate JWT token
        const token = jwt.sign(
            {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return user profile (without password hash)
        const userProfile = {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            profileImageUrl: foundUser.profileImageUrl,
            bio: foundUser.bio,
            timezone: foundUser.timezone,
            createdAt: foundUser.createdAt,
            lastActiveAt: foundUser.lastActiveAt,
            emailVerified: foundUser.emailVerified,
            pushNotificationsEnabled: foundUser.pushNotificationsEnabled
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userProfile,
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
app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
    const user = users.get(req.user.id);
    
    if (!user || !user.isActive) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    const userProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        emailVerified: user.emailVerified,
        pushNotificationsEnabled: user.pushNotificationsEnabled
    };

    res.status(200).json({
        success: true,
        data: userProfile
    });
});

// Logout user
app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        blacklistedTokens.add(token);
    }

    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
});

// Update user profile
app.put('/api/v1/users/me', authenticateToken, (req, res) => {
    const { firstName, lastName, bio, timezone, pushNotificationsEnabled } = req.body;
    const user = users.get(req.user.id);
    
    if (!user || !user.isActive) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (timezone !== undefined) user.timezone = timezone;
    if (pushNotificationsEnabled !== undefined) user.pushNotificationsEnabled = pushNotificationsEnabled;
    
    user.updatedAt = new Date().toISOString();
    users.set(user.id, user);

    const userProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        timezone: user.timezone,
        createdAt: user.createdAt,
        lastActiveAt: user.lastActiveAt,
        emailVerified: user.emailVerified,
        pushNotificationsEnabled: user.pushNotificationsEnabled
    };

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userProfile
    });
});

// Get all users (development endpoint)
app.get('/api/v1/dev/users', (req, res) => {
    const userList = Array.from(users.values()).map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        isActive: user.isActive
    }));

    res.json({
        success: true,
        data: {
            users: userList,
            total: userList.length
        }
    });
});

// Goal Management Endpoints

// Get goal categories
app.get('/api/v1/goals/categories', (req, res) => {
    const categoriesList = Array.from(goalCategories.values());
    
    res.json({
        success: true,
        data: {
            categories: categoriesList,
            total: categoriesList.length
        }
    });
});

// Get public goals (discover feed) - No auth required
app.get('/api/v1/goals/public', (req, res) => {
    const { category, limit = 20, offset = 0 } = req.query;
    
    let publicGoals = Array.from(goals.values())
        .filter(goal => goal.isPublic && goal.status === 'active');
    
    if (category) {
        publicGoals = publicGoals.filter(goal => goal.categoryId === category);
    }
    
    // Add user info and category info
    const goalsWithInfo = publicGoals
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(goal => ({
            ...goal,
            category: goalCategories.get(goal.categoryId),
            owner: {
                username: users.get(goal.userId)?.username || 'Unknown',
                firstName: users.get(goal.userId)?.firstName || null
            }
        }));

    res.json({
        success: true,
        data: {
            goals: goalsWithInfo,
            total: publicGoals.length,
            hasMore: (parseInt(offset) + parseInt(limit)) < publicGoals.length
        }
    });
});

// Get public check-ins feed - No auth required
app.get('/api/v1/check-ins/public', (req, res) => {
    const { category, limit = 20, offset = 0 } = req.query;
    
    let publicCheckIns = Array.from(checkIns.values())
        .filter(checkIn => checkIn.isPublic);
    
    // Filter by category if specified
    if (category) {
        publicCheckIns = publicCheckIns.filter(checkIn => {
            const goal = goals.get(checkIn.goalId);
            return goal && goal.categoryId === category;
        });
    }
    
    // Sort by date (newest first)
    publicCheckIns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add goal and user information
    const checkInsWithInfo = publicCheckIns
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(checkIn => {
            const goal = goals.get(checkIn.goalId);
            const user = users.get(checkIn.userId);
            return {
                ...checkIn,
                goal: goal ? {
                    id: goal.id,
                    title: goal.title,
                    category: goalCategories.get(goal.categoryId)
                } : null,
                owner: {
                    username: user?.username || 'Unknown',
                    firstName: user?.firstName || null
                }
            };
        });

    res.json({
        success: true,
        data: {
            checkIns: checkInsWithInfo,
            total: publicCheckIns.length,
            hasMore: (parseInt(offset) + parseInt(limit)) < publicCheckIns.length
        }
    });
});

// Get user's goals
app.get('/api/v1/goals', authenticateToken, (req, res) => {
    const userGoals = Array.from(goals.values())
        .filter(goal => goal.userId === req.user.id)
        .map(goal => ({
            ...goal,
            category: goalCategories.get(goal.categoryId)
        }));

    res.json({
        success: true,
        data: {
            goals: userGoals,
            total: userGoals.length
        }
    });
});

// Create new goal
app.post('/api/v1/goals', authenticateToken, (req, res) => {
    try {
        const { title, description, categoryId, targetDays, startDate, endDate, isPublic, reminderTime } = req.body;

        // Validation
        if (!title || !categoryId || !targetDays) {
            return res.status(400).json({
                success: false,
                error: 'Title, category, and target days are required'
            });
        }

        if (!goalCategories.has(categoryId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid goal category'
            });
        }

        if (targetDays < 1 || targetDays > 365) {
            return res.status(400).json({
                success: false,
                error: 'Target days must be between 1 and 365'
            });
        }

        // Create goal
        const goalId = uuidv4();
        const now = new Date().toISOString();
        const goal = {
            id: goalId,
            userId: req.user.id,
            title: title.trim(),
            description: description ? description.trim() : null,
            categoryId,
            targetDays: parseInt(targetDays),
            currentStreak: 0,
            longestStreak: 0,
            totalCheckIns: 0,
            startDate: startDate || now.split('T')[0],
            endDate: endDate || null,
            isPublic: isPublic === true,
            reminderTime: reminderTime || '09:00',
            status: 'active', // active, paused, completed, failed
            createdAt: now,
            updatedAt: now,
            lastCheckInAt: null
        };

        goals.set(goalId, goal);

        // Return goal with category info
        const goalWithCategory = {
            ...goal,
            category: goalCategories.get(goal.categoryId)
        };

        res.status(201).json({
            success: true,
            message: 'Goal created successfully',
            data: goalWithCategory
        });

    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get specific goal
app.get('/api/v1/goals/:id', authenticateToken, (req, res) => {
    const goalId = req.params.id;
    const goal = goals.get(goalId);

    if (!goal) {
        return res.status(404).json({
            success: false,
            error: 'Goal not found'
        });
    }

    // Check if user owns the goal or if it's public
    if (goal.userId !== req.user.id && !goal.isPublic) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    const goalWithCategory = {
        ...goal,
        category: goalCategories.get(goal.categoryId),
        owner: goal.userId !== req.user.id ? {
            username: users.get(goal.userId)?.username || 'Unknown'
        } : null
    };

    res.json({
        success: true,
        data: goalWithCategory
    });
});

// Update goal
app.put('/api/v1/goals/:id', authenticateToken, (req, res) => {
    try {
        const goalId = req.params.id;
        const goal = goals.get(goalId);

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const { title, description, categoryId, targetDays, endDate, isPublic, reminderTime, status } = req.body;

        // Update fields
        if (title !== undefined) goal.title = title.trim();
        if (description !== undefined) goal.description = description ? description.trim() : null;
        if (categoryId !== undefined) {
            if (!goalCategories.has(categoryId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid goal category'
                });
            }
            goal.categoryId = categoryId;
        }
        if (targetDays !== undefined) {
            const days = parseInt(targetDays);
            if (days < 1 || days > 365) {
                return res.status(400).json({
                    success: false,
                    error: 'Target days must be between 1 and 365'
                });
            }
            goal.targetDays = days;
        }
        if (endDate !== undefined) goal.endDate = endDate;
        if (isPublic !== undefined) goal.isPublic = isPublic === true;
        if (reminderTime !== undefined) goal.reminderTime = reminderTime;
        if (status !== undefined && ['active', 'paused', 'completed', 'failed'].includes(status)) {
            goal.status = status;
        }

        goal.updatedAt = new Date().toISOString();
        goals.set(goalId, goal);

        const goalWithCategory = {
            ...goal,
            category: goalCategories.get(goal.categoryId)
        };

        res.json({
            success: true,
            message: 'Goal updated successfully',
            data: goalWithCategory
        });

    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Delete goal
app.delete('/api/v1/goals/:id', authenticateToken, (req, res) => {
    const goalId = req.params.id;
    const goal = goals.get(goalId);

    if (!goal) {
        return res.status(404).json({
            success: false,
            error: 'Goal not found'
        });
    }

    if (goal.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    goals.delete(goalId);

    res.json({
        success: true,
        message: 'Goal deleted successfully'
    });
});



// Get goal statistics
app.get('/api/v1/goals/:id/stats', authenticateToken, (req, res) => {
    const goalId = req.params.id;
    const goal = goals.get(goalId);

    if (!goal) {
        return res.status(404).json({
            success: false,
            error: 'Goal not found'
        });
    }

    if (goal.userId !== req.user.id && !goal.isPublic) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    const stats = {
        totalCheckIns: goal.totalCheckIns,
        currentStreak: goal.currentStreak,
        longestStreak: goal.longestStreak,
        targetDays: goal.targetDays,
        completionRate: goal.targetDays > 0 ? (goal.totalCheckIns / goal.targetDays * 100).toFixed(1) : 0,
        daysActive: goal.createdAt ? Math.floor((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24)) + 1 : 0,
        lastCheckIn: goal.lastCheckInAt,
        status: goal.status
    };

    res.json({
        success: true,
        data: stats
    });
});

// Daily Check-in Management Endpoints

// Create check-in (daily proof upload)
app.post('/api/v1/check-ins', authenticateToken, (req, res) => {
    try {
        const { goalId, description, imageUrl, videoUrl, checkInDate } = req.body;

        // Validation
        if (!goalId) {
            return res.status(400).json({
                success: false,
                error: 'Goal ID is required'
            });
        }

        const goal = goals.get(goalId);
        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Goal not found'
            });
        }

        if (goal.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied - not your goal'
            });
        }

        if (goal.status !== 'active') {
            return res.status(400).json({
                success: false,
                error: 'Cannot check-in to inactive goal'
            });
        }

        // Use provided date or today
        const targetDate = checkInDate || new Date().toISOString().split('T')[0];
        
        // Check if already checked in today for this goal
        const existingCheckIn = Array.from(checkIns.values())
            .find(checkIn => 
                checkIn.goalId === goalId && 
                checkIn.checkInDate === targetDate
            );

        if (existingCheckIn) {
            return res.status(409).json({
                success: false,
                error: 'Already checked in for this date',
                data: existingCheckIn
            });
        }

        // Create check-in
        const checkInId = uuidv4();
        const now = new Date().toISOString();
        const checkIn = {
            id: checkInId,
            goalId,
            userId: req.user.id,
            checkInDate: targetDate,
            description: description || null,
            imageUrl: imageUrl || null,
            videoUrl: videoUrl || null,
            isPublic: goal.isPublic, // Inherit visibility from goal
            createdAt: now,
            updatedAt: now
        };

        checkIns.set(checkInId, checkIn);

        // Update goal streaks and stats
        updateGoalStreaks(goalId);

        // Return check-in with goal info
        const checkInWithGoal = {
            ...checkIn,
            goal: {
                id: goal.id,
                title: goal.title,
                category: goalCategories.get(goal.categoryId)
            }
        };

        res.status(201).json({
            success: true,
            message: 'Check-in created successfully',
            data: checkInWithGoal
        });

    } catch (error) {
        console.error('Create check-in error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get user's check-ins
app.get('/api/v1/check-ins', authenticateToken, (req, res) => {
    const { goalId, limit = 50, offset = 0, startDate, endDate } = req.query;
    
    let userCheckIns = Array.from(checkIns.values())
        .filter(checkIn => checkIn.userId === req.user.id);
    
    // Filter by goal if specified
    if (goalId) {
        userCheckIns = userCheckIns.filter(checkIn => checkIn.goalId === goalId);
    }
    
    // Filter by date range if specified
    if (startDate) {
        userCheckIns = userCheckIns.filter(checkIn => checkIn.checkInDate >= startDate);
    }
    if (endDate) {
        userCheckIns = userCheckIns.filter(checkIn => checkIn.checkInDate <= endDate);
    }
    
    // Sort by date (newest first)
    userCheckIns.sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate));
    
    // Add goal information
    const checkInsWithGoals = userCheckIns
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .map(checkIn => {
            const goal = goals.get(checkIn.goalId);
            return {
                ...checkIn,
                goal: goal ? {
                    id: goal.id,
                    title: goal.title,
                    category: goalCategories.get(goal.categoryId)
                } : null
            };
        });

    res.json({
        success: true,
        data: {
            checkIns: checkInsWithGoals,
            total: userCheckIns.length,
            hasMore: (parseInt(offset) + parseInt(limit)) < userCheckIns.length
        }
    });
});

// Get specific check-in
app.get('/api/v1/check-ins/:id', authenticateToken, (req, res) => {
    const checkInId = req.params.id;
    const checkIn = checkIns.get(checkInId);

    if (!checkIn) {
        return res.status(404).json({
            success: false,
            error: 'Check-in not found'
        });
    }

    // Check access permissions
    if (checkIn.userId !== req.user.id && !checkIn.isPublic) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    const goal = goals.get(checkIn.goalId);
    const checkInWithGoal = {
        ...checkIn,
        goal: goal ? {
            id: goal.id,
            title: goal.title,
            category: goalCategories.get(goal.categoryId)
        } : null,
        owner: checkIn.userId !== req.user.id ? {
            username: users.get(checkIn.userId)?.username || 'Unknown'
        } : null
    };

    res.json({
        success: true,
        data: checkInWithGoal
    });
});

// Update check-in
app.put('/api/v1/check-ins/:id', authenticateToken, (req, res) => {
    try {
        const checkInId = req.params.id;
        const checkIn = checkIns.get(checkInId);

        if (!checkIn) {
            return res.status(404).json({
                success: false,
                error: 'Check-in not found'
            });
        }

        if (checkIn.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        const { description, imageUrl, videoUrl } = req.body;

        // Update fields
        if (description !== undefined) checkIn.description = description;
        if (imageUrl !== undefined) checkIn.imageUrl = imageUrl;
        if (videoUrl !== undefined) checkIn.videoUrl = videoUrl;
        
        checkIn.updatedAt = new Date().toISOString();
        checkIns.set(checkInId, checkIn);

        const goal = goals.get(checkIn.goalId);
        const checkInWithGoal = {
            ...checkIn,
            goal: goal ? {
                id: goal.id,
                title: goal.title,
                category: goalCategories.get(goal.categoryId)
            } : null
        };

        res.json({
            success: true,
            message: 'Check-in updated successfully',
            data: checkInWithGoal
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
app.delete('/api/v1/check-ins/:id', authenticateToken, (req, res) => {
    const checkInId = req.params.id;
    const checkIn = checkIns.get(checkInId);

    if (!checkIn) {
        return res.status(404).json({
            success: false,
            error: 'Check-in not found'
        });
    }

    if (checkIn.userId !== req.user.id) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    const goalId = checkIn.goalId;
    checkIns.delete(checkInId);

    // Update goal streaks after deletion
    updateGoalStreaks(goalId);

    res.json({
        success: true,
        message: 'Check-in deleted successfully'
    });
});



// Get check-in statistics for a goal
app.get('/api/v1/goals/:goalId/check-ins/stats', authenticateToken, (req, res) => {
    const goalId = req.params.goalId;
    const goal = goals.get(goalId);

    if (!goal) {
        return res.status(404).json({
            success: false,
            error: 'Goal not found'
        });
    }

    if (goal.userId !== req.user.id && !goal.isPublic) {
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }

    const goalCheckIns = Array.from(checkIns.values())
        .filter(checkIn => checkIn.goalId === goalId)
        .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));

    // Calculate weekly stats (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCheckIns = goalCheckIns.filter(checkIn => 
        new Date(checkIn.checkInDate) >= weekAgo
    );

    // Calculate monthly stats (last 30 days)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const monthlyCheckIns = goalCheckIns.filter(checkIn => 
        new Date(checkIn.checkInDate) >= monthAgo
    );

    const stats = {
        totalCheckIns: goalCheckIns.length,
        weeklyCheckIns: weeklyCheckIns.length,
        monthlyCheckIns: monthlyCheckIns.length,
        currentStreak: goal.currentStreak,
        longestStreak: goal.longestStreak,
        lastCheckIn: goal.lastCheckInAt,
        checkInDates: goalCheckIns.map(checkIn => checkIn.checkInDate),
        averagePerWeek: goalCheckIns.length > 0 ? 
            (goalCheckIns.length / Math.max(1, Math.ceil((today - new Date(goalCheckIns[0].checkInDate)) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1) : 0
    };

    res.json({
        success: true,
        data: stats
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

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Commit Backend Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Web Interface: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/v1/test`);
    console.log(`\n🔐 Authentication endpoints:`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/auth/me`);
    console.log(`   POST http://localhost:${PORT}/api/v1/auth/logout`);
    console.log(`\n👤 User management:`);
    console.log(`   PUT  http://localhost:${PORT}/api/v1/users/me`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/dev/users (dev only)`);
    console.log(`\n🎯 Goal management:`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals/categories`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals`);
    console.log(`   POST http://localhost:${PORT}/api/v1/goals`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals/:id`);
    console.log(`   PUT  http://localhost:${PORT}/api/v1/goals/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/v1/goals/:id`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals/public`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals/:id/stats`);
    console.log(`\n📸 Daily check-ins:`);
    console.log(`   POST http://localhost:${PORT}/api/v1/check-ins`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/check-ins`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/check-ins/:id`);
    console.log(`   PUT  http://localhost:${PORT}/api/v1/check-ins/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/v1/check-ins/:id`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/check-ins/public`);
    console.log(`   GET  http://localhost:${PORT}/api/v1/goals/:goalId/check-ins/stats`);
    console.log(`\n📊 Total Categories: ${goalCategories.size}`);
    console.log(`📊 Total Users: ${users.size}`);
    console.log(`📊 Total Goals: ${goals.size}`);
    console.log(`📊 Total Check-ins: ${checkIns.size}`);
});

module.exports = app;
