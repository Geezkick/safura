const express = require('express');

const router = express.Router();

// In-memory store (replace with PostgreSQL in production)
const profiles = {};
const mealLogs = {};

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
