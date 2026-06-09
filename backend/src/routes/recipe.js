const express = require('express');
const { ask } = require('../services/claude');
const { MASTER, RECIPE } = require('../config/prompts');

const router = express.Router();

// POST /api/recipe/generate
router.post('/generate', async (req, res) => {
  try {
    const { ingredients, preferences, cuisineType, dietaryGoal, userProfile } = req.body;
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: 'ingredients array is required' });
    }

    const result = await ask({
      system: MASTER + '\n\n' + RECIPE,
      messages: [{
        role: 'user',
        content: [
          `Generate a complete recipe using:`,
          `Ingredients: ${ingredients.join(', ')}`,
          preferences   ? `Preferences: ${preferences}` : '',
          cuisineType   ? `Cuisine type: ${cuisineType}` : '',
          dietaryGoal   ? `Dietary goal: ${dietaryGoal}` : '',
          `User profile: ${JSON.stringify(userProfile || {})}`
        ].filter(Boolean).join('\n')
      }],
      maxTokens: 2048
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[recipe/generate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/recipe/leftover  — rescue meal from leftover description
router.post('/leftover', async (req, res) => {
  try {
    const { leftovers, userProfile } = req.body;
    if (!leftovers) return res.status(400).json({ error: 'leftovers description is required' });

    const result = await ask({
      system: MASTER + '\n\n' + RECIPE,
      messages: [{
        role: 'user',
        content: `I have these leftovers: ${leftovers}\nUser profile: ${JSON.stringify(userProfile || {})}\n\nCreate a creative rescue recipe from these leftovers.`
      }],
      maxTokens: 2048
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[recipe/leftover]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
