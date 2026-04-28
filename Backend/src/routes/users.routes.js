import express from 'express';
import { protect } from '../middleware/auth.js';
import { updateProfile, getUserProfile, getColleges, getMyProfile } from '../controllers/users.controller.js';

const router = express.Router();

// Public routes
router.get('/colleges', getColleges);              // GET /api/users/colleges?search=poornima

// Protected routes
router.get('/me', protect, getMyProfile);          // GET /api/users/me
router.put('/profile', protect, updateProfile);    // PUT /api/users/profile
router.get('/:id', protect, getUserProfile);       // GET /api/users/:id

export default router;
