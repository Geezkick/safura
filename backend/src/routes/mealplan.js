const express = require('express');
const { ask } = require('../services/claude');
const { MASTER, MEALPLAN } = require('../config/prompts');

const router = express.Router();

// POST /api/meal-plan/generate
router.post('/generate', async (req, res) => {
  try {
    const { userProfile, days = 7, budget, cookingSkill } = req.body;
    if (!userProfile) return res.status(400).json({ error: 'userProfile is required' });

    const result = await ask({
      system: MASTER + '\n\n' + MEALPLAN,
      messages: [{
        role: 'user',
        content: [
          `Generate a ${days}-day meal plan for this user:`,
          JSON.stringify(userProfile, null, 2),
          budget       ? `Weekly budget: ${budget}` : '',
          cookingSkill ? `Cooking skill level: ${cookingSkill}` : ''
        ].filter(Boolean).join('\n')
      }],
      maxTokens: 4096
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[mealplan/generate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
