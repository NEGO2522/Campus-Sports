import pool from '../db/pool.js';

// GET /api/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { scope = 'college', sport } = req.query;
    const collegeId = req.user.college_id;

    const conditions = [];
    const params = [];

    const addParam = (val) => { params.push(val); return '$' + params.length; };

    if (scope === 'college' && collegeId) {
      conditions.push('u.college_id = ' + addParam(collegeId));
    }

    // Sport filter: user ka sport_preferences array mein sport hona chahiye
    if (sport && sport !== 'All') {
      conditions.push(addParam(sport) + ' = ANY(u.sport_preferences)');
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const query = `
      SELECT
        u.id,
        u.full_name,
        u.points,
        u.sport_preferences,
        c.name as college_name,
        COUNT(DISTINCT ep.event_id) as events_played
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.id
      LEFT JOIN event_participants ep ON u.id = ep.user_id
      ${whereClause}
      GROUP BY u.id, u.full_name, u.points, u.sport_preferences, c.name
      ORDER BY u.points DESC
      LIMIT 50
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/leaderboard/award
// Event creator kisi bhi participant (direct ya team-based) ko points award kar sakta hai
export const awardPoints = async (req, res, next) => {
  try {
    const { eventId, userId, points, reason } = req.body;
    const awarderId = req.user.id;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!eventId || !userId || !points) {
      return res.status(400).json({ error: 'eventId, userId, aur points required hain' });
    }

    const pts = Number(points);
    if (!Number.isInteger(pts) || pts < 1 || pts > 1000) {
      return res.status(400).json({ error: 'Points 1 se 1000 ke beech hone chahiye' });
    }

    // ── Only event creator can award ──────────────────────────────────────────
    const eventCheck = await pool.query(
      'SELECT created_by, event_name FROM events WHERE id = $1',
      [eventId]
    );
    if (!eventCheck.rows[0]) {
      return res.status(404).json({ error: 'Event nahi mila' });
    }
    if (eventCheck.rows[0].created_by !== awarderId) {
      return res.status(403).json({ error: 'Sirf event creator points award kar sakta hai' });
    }

    // ── Participant check: direct participant OR team member ──────────────────
    // Direct participant (solo events)
    const directCheck = await pool.query(
      'SELECT id FROM event_participants WHERE event_id = $1 AND user_id = $2',
      [eventId, userId]
    );

    // Team member (team-based events)
    const teamCheck = await pool.query(
      `SELECT tm.id
       FROM team_members tm
       JOIN teams t ON tm.team_id = t.id
       WHERE t.event_id = $1 AND tm.user_id = $2`,
      [eventId, userId]
    );

    const isParticipant = directCheck.rows.length > 0 || teamCheck.rows.length > 0;
    if (!isParticipant) {
      return res.status(400).json({ error: 'Yeh user is event ka participant nahi hai' });
    }

    // ── Award points (atomic) ─────────────────────────────────────────────────
    await pool.query(
      'UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2',
      [pts, userId]
    );

    // ── Notification ──────────────────────────────────────────────────────────
    const notifMessage = reason
      ? `${pts} points award kiye gaye: ${reason}`
      : `${pts} points award kiye gaye "${eventCheck.rows[0].event_name}" ke liye!`;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, event_id)
       VALUES ($1, 'points_awarded', 'Points Awarded! 🏆', $2, $3)`,
      [userId, notifMessage, eventId]
    );

    // ── Return updated user ───────────────────────────────────────────────────
    const updated = await pool.query(
      'SELECT id, full_name, points FROM users WHERE id = $1',
      [userId]
    );

    res.json({
      message: `${pts} points successfully awarded!`,
      user: updated.rows[0],
    });

  } catch (err) {
    next(err);
  }
};
