const express = require('express');
const { ask } = require('../services/claude');
const prompts = require('../config/prompts');

const router = express.Router();

// Map frontend mode names → prompt keys
const MODE_MAP = {
  scan:         prompts.SCANNER,
  allergen:     prompts.ALLERGEN,
  nutrition:    prompts.NUTRITION,
  encyclopedia: prompts.ENCYCLOPEDIA,
  menu:         prompts.MENU,
  travel:       prompts.TRAVEL,
  recipe:       prompts.RECIPE,
  mealplan:     prompts.MEALPLAN,
  freshness:    prompts.FRESHNESS,
  ar:           prompts.SCANNER,    // AR uses scanner data format
  voice:        prompts.VOICE,
  passport:     prompts.PASSPORT,
  family:       prompts.FAMILY,
  carbon:       prompts.CARBON
};

// POST /api/chat  — Universal AI conversation for all 14 modules
router.post('/', async (req, res) => {
  try {
    const { messages, userProfile, mode } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Inject the correct module prompt based on the mode
    const modePrompt = MODE_MAP[mode] || '';
    const systemWithProfile = prompts.MASTER 
      + (modePrompt ? '\n\n' + modePrompt : '') 
      + `\n\n## Current User Profile\n${JSON.stringify(userProfile || {}, null, 2)}`;

    const result = await ask({
      system: systemWithProfile,
      messages,
      maxTokens: 4096
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[chat]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
