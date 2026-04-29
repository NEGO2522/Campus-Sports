import pool from '../db/pool.js';

// GET /api/users/count — public endpoint for total users count
export const getUsersCount = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const count = parseInt(result.rows[0].count, 10);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const {
      fullName, phone, age, gender,
      registrationNumber, courseName, collegeId, sportPreferences
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !age || !gender || !registrationNumber || !courseName || !collegeId) {
      return res.status(400).json({ error: 'Saari required fields bharo' });
    }

    // sportPreferences array hona chahiye
    const sports = Array.isArray(sportPreferences) ? sportPreferences : [];

    const result = await pool.query(
      `UPDATE users SET
        full_name        = $1,
        phone            = $2,
        age              = $3,
        gender           = $4,
        registration_number = $5,
        course_name      = $6,
        college_id       = $7,
        sport_preferences = $8,
        profile_completed = true,
        updated_at       = NOW()
       WHERE id = $9
       RETURNING id, email, full_name, phone, age, gender,
                 registration_number, course_name, college_id,
                 sport_preferences, profile_completed, points`,
      [fullName, phone, parseInt(age), gender, registrationNumber, courseName, collegeId, sports, req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/colleges — public, no auth needed
export const getColleges = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = 'SELECT id, name, city, state FROM colleges';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE name ILIKE $1 OR city ILIKE $1`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id — get any user's public profile
export const getUserProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.full_name, u.email, u.age, u.gender,
         u.registration_number, u.course_name,
         u.sport_preferences, u.points, u.profile_completed,
         c.name as college_name, c.city, c.state
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.id = $1`,
      [req.params.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me/events — events jo maine join kiye hain
export const getMyEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT DISTINCT
         e.id, e.event_name, e.sport, e.location, e.date_time,
         e.status, e.participation_type,
         c.name as college_name,
         t.name as team_name
       FROM events e
       LEFT JOIN colleges c ON e.college_id = c.id
       LEFT JOIN event_participants ep ON ep.event_id = e.id AND ep.user_id = $1
       LEFT JOIN team_members tm ON tm.user_id = $1
       LEFT JOIN teams t ON t.id = tm.team_id AND t.event_id = e.id
       WHERE ep.user_id = $1 OR tm.user_id = $1
       ORDER BY e.date_time DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// GET /api/users/search?q=rahul — search users by name or reg number
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const result = await pool.query(
      `SELECT
         u.id, u.full_name, u.registration_number, u.course_name,
         u.sport_preferences,
         c.name as college_name
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE (
         u.full_name ILIKE $1 OR
         u.registration_number ILIKE $1
       )
       AND u.id != $2
       AND u.profile_completed = true
       ORDER BY u.full_name ASC
       LIMIT 20`,
      [`%${q.trim()}%`, req.user.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// GET /api/users/me — current logged in user full profile
export const getMyProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.full_name, u.email, u.phone, u.age, u.gender,
         u.registration_number, u.course_name, u.college_id,
         u.sport_preferences, u.points, u.profile_completed,
         c.name as college_name, c.city, c.state,
         COUNT(DISTINCT ev.id) as managed_events_count,
         (
           -- Count events joined directly as individual participant
           SELECT COUNT(DISTINCT ep.event_id)
           FROM event_participants ep
           WHERE ep.user_id = u.id
         ) +
         (
           -- Count events joined via a team (team-based events),
           -- but only if NOT already counted as a direct participant
           SELECT COUNT(DISTINCT t.event_id)
           FROM team_members tm
           JOIN teams t ON tm.team_id = t.id
           WHERE tm.user_id = u.id
             AND t.event_id NOT IN (
               SELECT ep2.event_id
               FROM event_participants ep2
               WHERE ep2.user_id = u.id
             )
         ) AS events_joined,
         (
           SELECT COUNT(DISTINCT m.id)
           FROM matches m
           JOIN teams t ON (t.id = m.team1_id OR t.id = m.team2_id)
           JOIN team_members tm ON tm.team_id = t.id
           WHERE tm.user_id = u.id
             AND m.status = 'completed'
         ) as matches_played
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       LEFT JOIN events ev  ON ev.created_by = u.id
       WHERE u.id = $1
       GROUP BY u.id, c.name, c.city, c.state`,
      [req.user.id]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};
