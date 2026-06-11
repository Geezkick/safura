require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const scanRoutes    = require('./routes/scan');
const chatRoutes    = require('./routes/chat');
const recipeRoutes  = require('./routes/recipe');
const userRoutes    = require('./routes/user');
const planRoutes    = require('./routes/mealplan');
const freshRoutes   = require('./routes/freshness');
const authRoutes    = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & Middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.APP_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: 'Too many requests' } });
app.use('/api/', limiter);

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/scan',      scanRoutes);
app.use('/api/chat',      chatRoutes);
app.use('/api/recipe',    recipeRoutes);
app.use('/api/user',      userRoutes);
app.use('/api/meal-plan', planRoutes);
app.use('/api/freshness', freshRoutes);

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Safura AI',
    version: '1.0.0',
    tagline: 'Understand every meal.',
    timestamp: new Date().toISOString()
  });
});

// ── 404 handler ────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Error handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🍽️  Safura AI backend running on port ${PORT}`);
  console.log(`   "Understand every meal."\n`);
});

module.exports = app;
