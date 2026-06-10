const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// In-memory store (replace with PostgreSQL in production)
const users = {}; // Map of email -> user details
const profiles = {};
const mealLogs = {};

const JWT_SECRET = process.env.JWT_SECRET || 'safura-change-this-secret-in-production';

// POST /api/user/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (users[email]) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Simple id generation
    const userId = 'usr_' + Date.now().toString(36);
    
    users[email] = { id: userId, email, password: hashedPassword, name };
    profiles[userId] = { name, email, allergens: [] };
    
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: userId, email, name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/user/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users[email];
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/user/profile/:id
router.get('/profile/:id', (req, res) => {
  const profile = profiles[req.params.id] || null;
  res.json({ success: true, profile });
});

// PUT /api/user/profile/:id
router.put('/profile/:id', (req, res) => {
  profiles[req.params.id] = { ...profiles[req.params.id], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, profile: profiles[req.params.id] });
});

// POST /api/user/log-meal
router.post('/log-meal', (req, res) => {
  const { userId, meal } = req.body;
  if (!userId || !meal) return res.status(400).json({ error: 'userId and meal are required' });

  if (!mealLogs[userId]) mealLogs[userId] = [];
  const entry = { ...meal, loggedAt: new Date().toISOString() };
  mealLogs[userId].push(entry);

  res.json({ success: true, entry });
});

// GET /api/user/nutrition/today
router.get('/nutrition/today', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const today = new Date().toDateString();
  const todayLogs = (mealLogs[userId] || []).filter(m => new Date(m.loggedAt).toDateString() === today);

  const totals = todayLogs.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein:  acc.protein  + (m.protein  || 0),
    carbs:    acc.carbs    + (m.carbs    || 0),
    fat:      acc.fat      + (m.fat      || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  res.json({ success: true, date: today, meals: todayLogs, totals });
});

// GET /api/passport/badges
router.get('/passport/badges', (req, res) => {
  const { userId } = req.query;
  const profile = profiles[userId] || {};
  res.json({
    success: true,
    badges: profile.food_passport_badges || [],
    cuisines_explored: profile.cuisine_explored || [],
    count: (profile.cuisine_explored || []).length
  });
});

module.exports = router;
