import pool from '../db/pool.js';

// GET /api/events — location-based filtering (yahi core feature hai)
export const getEvents = async (req, res, next) => {
  try {
    const { sport, status = 'upcoming' } = req.query;
    const collegeId = req.user.college_id; // JWT se aata hai

    let queryText = `
      SELECT
        e.*,
        u.full_name as creator_name,
        c.name as college_name,
        c.city,
        COUNT(DISTINCT ep.user_id) as participant_count
      FROM events e
      JOIN users u ON e.created_by = u.id
      LEFT JOIN colleges c ON e.college_id = c.id
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      WHERE e.status = $1
    `;
    const params = [status];

    // CORE FEATURE: sirf apne college ke events dikhao
    if (collegeId) {
      params.push(collegeId);
      queryText += ` AND e.college_id = $${params.length}`;
    }

    if (sport) {
      params.push(sport);
      queryText += ` AND e.sport = $${params.length}`;
    }

    queryText += ` GROUP BY e.id, u.full_name, c.name, c.city ORDER BY e.date_time ASC`;

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await pool.query(
      `SELECT e.*, u.full_name as creator_name, c.name as college_name
       FROM events e
       JOIN users u ON e.created_by = u.id
       LEFT JOIN colleges c ON e.college_id = c.id
       WHERE e.id = $1`,
      [id]
    );
    if (!event.rows[0]) return res.status(404).json({ error: 'Event not found' });

    const participants = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.registration_number
       FROM event_participants ep JOIN users u ON ep.user_id = u.id
       WHERE ep.event_id = $1`, [id]
    );

    const teams = await pool.query(
      `SELECT t.*, u.full_name as leader_name,
              COUNT(tm.user_id) as member_count
       FROM teams t
       JOIN users u ON t.leader_id = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.event_id = $1
       GROUP BY t.id, u.full_name`, [id]
    );

    res.json({ ...event.rows[0], participants: participants.rows, teams: teams.rows });
  } catch (err) { next(err); }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      eventName, sport, description, location, lat, lng,
      dateTime, registrationDeadline, participationType,
      playersNeeded, teamsNeeded, teamSize
    } = req.body;

    const result = await pool.query(
      `INSERT INTO events
       (event_name, sport, description, location, lat, lng, college_id,
        date_time, registration_deadline, participation_type,
        players_needed, teams_needed, team_size, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [eventName, sport, description, location, lat, lng,
       req.user.college_id, dateTime, registrationDeadline,
       participationType, playersNeeded, teamsNeeded, teamSize, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT created_by FROM events WHERE id = $1', [id]);
    if (!check.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (check.rows[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your event' });

    const { eventName, sport, description, location, dateTime, registrationDeadline } = req.body;
    const result = await pool.query(
      `UPDATE events SET event_name=$1, sport=$2, description=$3,
       location=$4, date_time=$5, registration_deadline=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [eventName, sport, description, location, dateTime, registrationDeadline, id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT created_by FROM events WHERE id = $1', [id]);
    if (check.rows[0]?.created_by !== req.user.id) return res.status(403).json({ error: 'Not your event' });
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    res.json({ message: 'Event deleted' });
  } catch (err) { next(err); }
};

export const joinEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.user.id;

    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (!event.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (new Date() > new Date(event.rows[0].registration_deadline)) {
      return res.status(400).json({ error: 'Registration deadline passed' });
    }

    await pool.query(
      'INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [eventId, userId]
    );

    // Real-time notification to event room
    req.io.to(`event_${eventId}`).emit('participant_joined', { userId, eventId });

    res.json({ message: 'Joined successfully' });
  } catch (err) { next(err); }
};

export const leaveEvent = async (req, res, next) => {
  try {
    await pool.query(
      'DELETE FROM event_participants WHERE event_id=$1 AND user_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Left event' });
  } catch (err) { next(err); }
};