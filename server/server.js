const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./db/connection');
const User = require('./models/User');

const app = express();
const port = 3000;
const JWT_SECRET = 'your-secret-key'; // Change this in production

// Serve static files from the 'public' directory
app.use(express.static('public'));
app.use(express.json());

connectDB();

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, password, leetcodeUsername } = req.body;
        const user = new User({ username, password, leetcodeUsername });
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error();
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: 'Login failed' });
    }
});

// Save problem
app.post('/api/problems', auth, async (req, res) => {
    try {
        req.user.problems.push(req.body);
        await req.user.save();
        res.status(201).json(req.body);
    } catch (error) {
        res.status(400).json({ error: 'Failed to save problem' });
    }
});

// Get problems
app.get('/api/problems', auth, async (req, res) => {
    res.json(req.user.problems);
});

app.get('/api/leetcode-stats/:username', async (req, res) => {
    const { username } = req.params;
    
    try {
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);
        const data = await response.json();

        if (data.status === 'error' || !data.totalSolved) {
            return res.status(404).json({ 
                error: 'User not found or profile is private'
            });
        }

        const stats = [
            { difficulty: 'EASY', count: data.easySolved || 0 },
            { difficulty: 'MEDIUM', count: data.mediumSolved || 0 },
            { difficulty: 'HARD', count: data.hardSolved || 0 }
        ];

        res.json({ 
            data: { 
                matchedUser: { 
                    submitStats: { 
                        acSubmissionNum: stats 
                    } 
                } 
            } 
        });
    } catch (error) {
        console.error('LeetCode API Error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch LeetCode stats. Please try again later.'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 