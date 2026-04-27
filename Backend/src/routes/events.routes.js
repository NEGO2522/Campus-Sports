import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getEvents, getEventById, createEvent,
  updateEvent, deleteEvent, joinEvent, leaveEvent
} from '../controllers/events.controller.js';

const router = express.Router();

router.get('/', protect, getEvents);           // GET /api/events?college_id=xxx&sport=Cricket
router.get('/:id', protect, getEventById);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/join', protect, joinEvent);
router.post('/:id/leave', protect, leaveEvent);

export default router;