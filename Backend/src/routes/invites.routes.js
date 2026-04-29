import express from 'express';
import { protect } from '../middleware/auth.js';
import { getPendingInvites, acceptInvite, declineInvite } from '../controllers/invites.controller.js';

const router = express.Router();

router.get('/pending',          protect, getPendingInvites);
router.put('/:inviteId/accept', protect, acceptInvite);
router.delete('/:inviteId',     protect, declineInvite);

export default router;
