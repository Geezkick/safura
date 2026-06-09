const express = require('express');
const { ask } = require('../services/claude');
const { MASTER, NUTRITION, ALLERGEN } = require('../config/prompts');

const router = express.Router();

// POST /api/chat  — AI nutritionist conversation
router.post('/', async (req, res) => {
  try {
    const { messages, userProfile, mode } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    // Append mode-specific module to system prompt
    let modePrompt = '';
    if (mode === 'nutrition') modePrompt = '\n\n' + NUTRITION;
    if (mode === 'allergen')  modePrompt = '\n\n' + ALLERGEN;

    const systemWithProfile = MASTER + modePrompt + `\n\n## Current User Profile\n${JSON.stringify(userProfile || {}, null, 2)}`;

    const result = await ask({
      system: systemWithProfile,
      messages,
      maxTokens: 2048
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[chat]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
