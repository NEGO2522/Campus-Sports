import pool from '../db/pool.js';

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
