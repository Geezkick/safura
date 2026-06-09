const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const { scanImage, ask } = require('../services/claude');
const { MASTER, FRESHNESS } = require('../config/prompts');

const router = express.Router();
const upload = multer({ limits: { fileSize: 8 * 1024 * 1024 } });

// POST /api/freshness/check  — image-based freshness assessment
router.post('/check', upload.single('image'), async (req, res) => {
  try {
    const description = req.body.description;

    let result;

    if (req.file) {
      const compressed = await sharp(req.file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      result = await scanImage({
        base64Image: compressed.toString('base64'),
        mediaType: 'image/jpeg',
        userProfile: {},
        systemPrompt: MASTER + '\n\n' + FRESHNESS
      });
    } else if (description) {
      result = await ask({
        system: MASTER + '\n\n' + FRESHNESS,
        messages: [{
          role: 'user',
          content: `Assess the freshness of this food based on the description:\n\n${description}`
        }]
      });
    } else {
      return res.status(400).json({ error: 'Either an image or a description is required' });
    }

    res.json({ success: true, result });
  } catch (err) {
    console.error('[freshness/check]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
