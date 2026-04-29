import express from 'express';
import { protect } from '../middleware/auth.js';
import { getLeaderboard, awardPoints } from '../controllers/leaderboard.controller.js';

const router = express.Router();

router.get('/', protect, getLeaderboard);
router.post('/award', protect, awardPoints);

export default router;
