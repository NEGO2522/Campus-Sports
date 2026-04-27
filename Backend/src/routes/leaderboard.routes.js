import express from 'express';
import { protect } from '../middleware/auth.js';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';

const router = express.Router();
router.get('/', protect, getLeaderboard);  // ?sport=Cricket&scope=college

export default router;