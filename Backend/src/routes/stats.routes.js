import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const [athletes, events, colleges, matches] = await Promise.all([
      pool.query('SELECT COUNT(DISTINCT id) AS count FROM users'),
      pool.query('SELECT COUNT(*) AS count FROM events'),
      pool.query('SELECT COUNT(*) AS count FROM colleges'),
      pool.query('SELECT COUNT(*) AS count FROM matches'),
    ]);

    res.json({
      athletes: parseInt(athletes.rows[0].count),
      events:   parseInt(events.rows[0].count),
      colleges: parseInt(colleges.rows[0].count),
      matches:  parseInt(matches.rows[0].count),
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
