import pool from '../db/pool.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { sport, scope = 'college' } = req.query;
    const collegeId = req.user.college_id;

    let query = `
      SELECT
        u.id, u.full_name, u.points, u.sport_preferences,
        c.name as college_name,
        COUNT(DISTINCT ep.event_id) as events_played
      FROM users u
      LEFT JOIN colleges c ON u.college_id = c.id
      LEFT JOIN event_participants ep ON u.id = ep.user_id
    `;

    const params = [];
    if (scope === 'college' && collegeId) {
      params.push(collegeId);
      query += ` WHERE u.college_id = $${params.length}`;
    }

    query += ` GROUP BY u.id, u.full_name, u.points, u.sport_preferences, c.name`;
    query += ` ORDER BY u.points DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { next(err); }
};