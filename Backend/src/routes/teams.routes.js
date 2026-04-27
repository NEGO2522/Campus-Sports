import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createTeam, getTeamsByEvent, joinTeam, leaveTeam, inviteMember
} from '../controllers/teams.controller.js';

const router = express.Router();

router.post('/', protect, createTeam);
router.get('/event/:eventId', protect, getTeamsByEvent);
router.post('/:teamId/join', protect, joinTeam);
router.post('/:teamId/leave', protect, leaveTeam);
router.post('/:teamId/invite', protect, inviteMember);

export default router;
