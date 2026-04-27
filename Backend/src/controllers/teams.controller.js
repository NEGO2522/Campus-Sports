import pool from '../db/pool.js';

export const createTeam = async (req, res, next) => {
  try {
    const { eventId, name } = req.body;
    const leaderId = req.user.id;

    const team = await pool.query(
      `INSERT INTO teams (event_id, name, leader_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [eventId, name, leaderId]
    );

    // Leader ko automatically member banao
    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)`,
      [team.rows[0].id, leaderId]
    );

    // event_participants mein bhi add karo
    await pool.query(
      `INSERT INTO event_participants (event_id, user_id, team_id)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [eventId, leaderId, team.rows[0].id]
    );

    res.status(201).json(team.rows[0]);
  } catch (err) { next(err); }
};

export const getTeamsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const result = await pool.query(
      `SELECT t.*, u.full_name as leader_name,
              COUNT(tm.user_id) as member_count
       FROM teams t
       JOIN users u ON t.leader_id = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.event_id = $1
       GROUP BY t.id, u.full_name
       ORDER BY t.created_at ASC`,
      [eventId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const joinTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (!team.rows[0]) return res.status(404).json({ error: 'Team not found' });

    await pool.query(
      `INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [teamId, userId]
    );

    await pool.query(
      `INSERT INTO event_participants (event_id, user_id, team_id)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [team.rows[0].event_id, userId, teamId]
    );

    req.io.to(`event_${team.rows[0].event_id}`).emit('team_updated', { teamId });

    res.json({ message: 'Team join ho gaya' });
  } catch (err) { next(err); }
};

export const leaveTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (!team.rows[0]) return res.status(404).json({ error: 'Team not found' });

    if (team.rows[0].leader_id === userId) {
      return res.status(400).json({ error: 'Leader team nahi chod sakta — pehle kisi aur ko leader banao' });
    }

    await pool.query('DELETE FROM team_members WHERE team_id=$1 AND user_id=$2', [teamId, userId]);
    await pool.query(
      'DELETE FROM event_participants WHERE event_id=$1 AND user_id=$2',
      [team.rows[0].event_id, userId]
    );

    res.json({ message: 'Team chod di' });
  } catch (err) { next(err); }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { inviteeId } = req.body;
    const inviterId = req.user.id;

    const team = await pool.query('SELECT * FROM teams WHERE id = $1', [teamId]);
    if (!team.rows[0]) return res.status(404).json({ error: 'Team not found' });

    await pool.query(
      `INSERT INTO team_invites (team_id, event_id, inviter_id, invitee_id)
       VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
      [teamId, team.rows[0].event_id, inviterId, inviteeId]
    );

    // Notification bhejo
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, team_id, event_id)
       VALUES ($1, 'team_invite', 'Team Invite', 'Tumhe ek team mein invite kiya gaya hai', $2, $3)`,
      [inviteeId, teamId, team.rows[0].event_id]
    );

    req.io.to(`user_${inviteeId}`).emit('new_notification', { type: 'team_invite' });

    res.json({ message: 'Invite bhej diya' });
  } catch (err) { next(err); }
};
