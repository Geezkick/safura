const express = require('express');
const multer  = require('multer');
const sharp   = require('sharp');
const { scanImage, ask } = require('../services/claude');
const { MASTER, SCANNER } = require('../config/prompts');

const router = express.Router();
const upload = multer({ limits: { fileSize: 8 * 1024 * 1024 } });

// POST /api/scan/image  — upload food photo
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });

    const userProfile = JSON.parse(req.body.userProfile || '{}');

    // Compress & resize before sending to Claude (max 1200px, 85% JPEG)
    const compressed = await sharp(req.file.buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64 = compressed.toString('base64');

    const result = await scanImage({
      base64Image: base64,
      mediaType: 'image/jpeg',
      userProfile,
      systemPrompt: MASTER + '\n\n' + SCANNER
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[scan/image]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scan/text  — describe food by name/text
router.post('/text', async (req, res) => {
  try {
    const { foodName, userProfile } = req.body;
    if (!foodName) return res.status(400).json({ error: 'foodName is required' });

    const result = await ask({
      system: MASTER + '\n\n' + SCANNER,
      messages: [{
        role: 'user',
        content: `Scan this food and return the full Safura scan card:\n\nFood: ${foodName}\n\nUser profile: ${JSON.stringify(userProfile || {})}`
      }]
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('[scan/text]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/scan/barcode  — barcode lookup (stub — add real DB/API)
router.post('/barcode', async (req, res) => {
  try {
    const { barcode, userProfile } = req.body;
    if (!barcode) return res.status(400).json({ error: 'barcode is required' });

    const result = await ask({
      system: MASTER + '\n\n' + SCANNER,
      messages: [{
        role: 'user',
        content: `A user scanned barcode: ${barcode}. Look up this product and return the Safura scan card. Profile: ${JSON.stringify(userProfile || {})}`
      }]
    });

    res.json({ success: true, barcode, result });
  } catch (err) {
    console.error('[scan/barcode]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
