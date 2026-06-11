const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get the user's health profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: req.user.userId }
    });
    res.json({ success: true, profile });
  } catch (error) {
    console.error('[profile/get]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update the user's health profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    // Don't allow changing IDs
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const profile = await prisma.healthProfile.upsert({
      where: { userId: req.user.userId },
      update: updateData,
      create: {
        userId: req.user.userId,
        ...updateData
      }
    });
    res.json({ success: true, profile });
  } catch (error) {
    console.error('[profile/put]', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
