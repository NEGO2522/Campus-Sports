import pool from '../db/pool.js';

// GET /api/events
export const getEvents = async (req, res, next) => {
  try {
    const { sport, status = 'upcoming', createdByMe, eventType } = req.query;
    const collegeId = req.user.college_id;

    const conditions = [];
    const params = [];

    const addParam = (val) => {
      params.push(val);
      return '$' + params.length;
    };

    if (createdByMe === 'true') {
      conditions.push('e.created_by = ' + addParam(req.user.id));
    } else {
      conditions.push('e.status = ' + addParam(status));
      if (collegeId) {
        conditions.push('(e.college_id = ' + addParam(collegeId) + ' OR e.college_id IS NULL)');
      }
    }

    if (sport) {
      conditions.push('e.sport = ' + addParam(sport));
    }

    if (eventType) {
      conditions.push('e.event_type = ' + addParam(eventType));
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    const queryText = `
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
      ${whereClause}
      GROUP BY e.id, u.full_name, c.name, c.city
      ORDER BY e.date_time ASC
    `;

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
       WHERE ep.event_id = $1`,
      [id]
    );

    const teams = await pool.query(
      `SELECT t.*, u.full_name as leader_name,
              COUNT(tm.user_id) as member_count
       FROM teams t
       JOIN users u ON t.leader_id = u.id
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.event_id = $1
       GROUP BY t.id, u.full_name`,
      [id]
    );

    res.json({ ...event.rows[0], participants: participants.rows, teams: teams.rows });
  } catch (err) { next(err); }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      eventName, sport, description, location, lat, lng,
      dateTime, registrationDeadline, participationType,
      playersNeeded, teamsNeeded, teamSize, eventType = 'official'
    } = req.body;

    // For community events, use dateTime as registrationDeadline if not provided
    let effectiveDeadline = registrationDeadline;
    if (eventType === 'community' && !registrationDeadline) {
      effectiveDeadline = dateTime;
    }

    const result = await pool.query(
      `INSERT INTO events
       (event_name, sport, description, location, lat, lng, college_id,
        date_time, registration_deadline, participation_type,
        players_needed, teams_needed, team_size, created_by, event_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [eventName, sport, description, location, lat, lng,
       req.user.college_id, dateTime, effectiveDeadline,
       participationType, playersNeeded, teamsNeeded, teamSize, req.user.id, eventType]
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

    const { eventName, sport, description, location, dateTime, registrationDeadline, status } = req.body;

    // Status-only patch (ManageEvents page se)
    if (status && !eventName && !sport && !dateTime) {
      const allowed = ['upcoming', 'ongoing', 'completed'];
      if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
      const result = await pool.query(
        'UPDATE events SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
        [status, id]
      );
      return res.json(result.rows[0]);
    }

    // Full update (COALESCE — sirf jo fields aaye unhe update karo)
    const result = await pool.query(
      `UPDATE events
       SET event_name             = COALESCE($1, event_name),
           sport                  = COALESCE($2, sport),
           description            = COALESCE($3, description),
           location               = COALESCE($4, location),
           date_time              = COALESCE($5, date_time),
           registration_deadline  = COALESCE($6, registration_deadline),
           status                 = COALESCE($7, status),
           updated_at             = NOW()
       WHERE id = $8
       RETURNING *`,
      [eventName, sport, description, location, dateTime, registrationDeadline, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT created_by FROM events WHERE id = $1', [id]);
    if (!check.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (check.rows[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your event' });
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

    // Creator cannot join their own event as a participant
    if (event.rows[0].created_by === userId) {
      return res.status(400).json({ error: 'You cannot join an event you created' });
    }

    await pool.query(
      'INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [eventId, userId]
    );

    // Get updated participant count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM event_participants WHERE event_id = $1',
      [eventId]
    );
    const participantCount = parseInt(countResult.rows[0].count);

    req.io.to('event_' + eventId).emit('participant_joined', { userId, eventId, participantCount });
    req.io.to('event_' + eventId).emit('participant_count_update', { eventId, participantCount });

    res.json({ message: 'Joined successfully', participantCount });
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

// ── MATCHES ──────────────────────────────────────────────────────────────────

export const getMatches = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT m.*,
              t1.team_name as team1_name,
              t2.team_name as team2_name
       FROM matches m
       LEFT JOIN teams t1 ON m.team1_id = t1.id
       LEFT JOIN teams t2 ON m.team2_id = t2.id
       WHERE m.event_id = $1
       ORDER BY m.match_date ASC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const createMatch = async (req, res, next) => {
  try {
    // Only event creator can create matches
    const eventCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [req.params.id]);
    if (!eventCheck.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the event creator can manage matches' });
    }

    const { round, team1Id, team2Id, location, matchDate } = req.body;
    const result = await pool.query(
      `INSERT INTO matches (event_id, round, team1_id, team2_id, location, match_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,'scheduled')
       RETURNING *`,
      [req.params.id, round, team1Id, team2Id, location, matchDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const updateMatch = async (req, res, next) => {
  try {
    const { id: eventId, matchId } = req.params;

    const eventCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [eventId]);
    if (!eventCheck.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the event creator can manage matches' });
    }

    const { team1Score, team2Score, status, round, team1Id, team2Id, location, matchDate } = req.body;

    const result = await pool.query(
      `UPDATE matches
       SET team1_score = COALESCE($1, team1_score),
           team2_score = COALESCE($2, team2_score),
           status      = COALESCE($3, status),
           round       = COALESCE($4, round),
           team1_id    = COALESCE($5, team1_id),
           team2_id    = COALESCE($6, team2_id),
           location    = COALESCE($7, location),
           match_date  = COALESCE($8, match_date),
           updated_at  = NOW()
       WHERE id = $9 AND event_id = $10
       RETURNING *`,
      [team1Score, team2Score, status, round, team1Id, team2Id, location, matchDate, matchId, eventId]
    );

    if (!result.rows[0]) return res.status(404).json({ error: 'Match not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

export const deleteMatch = async (req, res, next) => {
  try {
    const { id: eventId, matchId } = req.params;

    const eventCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [eventId]);
    if (!eventCheck.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the event creator can manage matches' });
    }

    await pool.query('DELETE FROM matches WHERE id=$1 AND event_id=$2', [matchId, eventId]);
    res.json({ message: 'Match deleted' });
  } catch (err) { next(err); }
};

// GET /api/events/count — public endpoint for total events count
export const getEventsCount = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM events');
    const count = parseInt(result.rows[0].count, 10);
    res.json({ count });
  } catch (err) {
    next(err);
  }
};
