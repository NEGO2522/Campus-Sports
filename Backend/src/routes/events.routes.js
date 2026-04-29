import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getEvents, getEventById, createEvent,
  updateEvent, deleteEvent, joinEvent, leaveEvent,
  getMatches, createMatch, updateMatch, deleteMatch,
  getEventsCount
} from '../controllers/events.controller.js';

const router = express.Router();

// Public routes (no auth required)
router.get('/count', getEventsCount);  // GET /api/events/count — total events

// Protected routes
router.get('/',           protect, getEvents);
router.get('/:id',        protect, getEventById);
router.post('/',          protect, createEvent);
router.put('/:id',        protect, updateEvent);
router.delete('/:id',     protect, deleteEvent);
router.post('/:id/join',  protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

// Matches sub-resource
router.get('/:id/matches',          protect, getMatches);
router.post('/:id/matches',         protect, createMatch);
router.put('/:id/matches/:matchId', protect, updateMatch);
router.delete('/:id/matches/:matchId', protect, deleteMatch);

export default router;
