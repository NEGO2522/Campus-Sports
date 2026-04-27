import express from 'express';
import { protect } from '../middleware/auth.js';
import { updateProfile, getUserProfile, getColleges } from '../controllers/users.controller.js';

const router = express.Router();
router.put('/profile', protect, updateProfile);
router.get('/colleges', getColleges);            // Public — dropdown ke liye
router.get('/:id', protect, getUserProfile);

export default router;