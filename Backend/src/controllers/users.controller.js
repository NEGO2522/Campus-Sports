import pool from '../db/pool.js';

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, age, gender, registrationNumber, courseName, collegeId, sportPreferences } = req.body;
    const result = await pool.query(
      `UPDATE users SET
        full_name=$1, phone=$2, age=$3, gender=$4,
        registration_number=$5, course_name=$6,
        college_id=$7, sport_preferences=$8,
        profile_completed=true, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [fullName, phone, age, gender, registrationNumber, courseName,
       collegeId, sportPreferences, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.*, c.name as college_name, c.city
       FROM users u LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    const { google_id, ...safeUser } = result.rows[0]; // google_id expose mat karo
    res.json(safeUser);
  } catch (err) { next(err); }
};

export const getColleges = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, city, state FROM colleges ORDER BY name');
    res.json(result.rows);
  } catch (err) { next(err); }
};