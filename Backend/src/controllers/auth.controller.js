import pool from '../db/pool.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, college_id: user.college_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// POST /api/auth/google
export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'ID token required' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();

    // Find or create user
    let result = await pool.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleId, email]
    );
    let user = result.rows[0];

    if (!user) {
      const insert = await pool.query(
        `INSERT INTO users (google_id, email, full_name, profile_completed)
         VALUES ($1, $2, $3, false) RETURNING *`,
        [googleId, email, name]
      );
      user = insert.rows[0];
    } else if (!user.google_id) {
      await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        profileCompleted: user.profile_completed,
        collegeId: user.college_id,
        picture,
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.*, c.name as college_name, c.city
       FROM users u
       LEFT JOIN colleges c ON u.college_id = c.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
    const { google_id, ...safeUser } = result.rows[0];
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
};
