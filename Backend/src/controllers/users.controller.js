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
         c.name as college_name, c.city, c.state
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.id = $1`,
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
