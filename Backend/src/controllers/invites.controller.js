import pool from '../db/pool.js';

// GET /api/invites/pending — my pending invites
export const getPendingInvites = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT
         ti.id          AS "inviteId",
         ti.team_id     AS "teamId",
         ti.event_id    AS "eventId",
         e.event_name   AS "eventName",
         t.name         AS "teamName",
         u.full_name    AS "inviterName",
         u.email        AS "inviterEmail"
       FROM team_invites ti
       JOIN events e  ON ti.event_id   = e.id
       JOIN teams  t  ON ti.team_id    = t.id
       JOIN users  u  ON ti.inviter_id = u.id
       WHERE ti.invitee_id = $1 AND ti.status = 'pending'
       ORDER BY ti.created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// PUT /api/invites/:inviteId/accept
export const acceptInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    const invite = await pool.query(
      `SELECT * FROM team_invites WHERE id = $1 AND invitee_id = $2 AND status = 'pending'`,
      [inviteId, userId]
    );
    if (!invite.rows[0]) return res.status(404).json({ error: 'Invite not found' });

    const { team_id, event_id } = invite.rows[0];

    await pool.query(`UPDATE team_invites SET status = 'accepted' WHERE id = $1`, [inviteId]);

    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [team_id, userId]
    );
    await pool.query(
      `INSERT INTO event_participants (event_id, user_id, team_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [event_id, userId, team_id]
    );

    res.json({ message: 'Invite accepted, you have joined the team' });
  } catch (err) { next(err); }
};

// DELETE /api/invites/:inviteId — decline/dismiss
export const declineInvite = async (req, res, next) => {
  try {
    const { inviteId } = req.params;
    const userId = req.user.id;

    await pool.query(
      `DELETE FROM team_invites WHERE id = $1 AND invitee_id = $2`,
      [inviteId, userId]
    );
    res.json({ message: 'Invite dismissed' });
  } catch (err) { next(err); }
};
