import pool from '../db/pool.js';

// PUT /api/events/:id
export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const check = await pool.query('SELECT created_by FROM events WHERE id = $1', [id]);
    if (!check.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (check.rows[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your event' });

    const { eventName, sport, description, location, dateTime, registrationDeadline, status } = req.body;

    // Status-only update (toggle ongoing/upcoming from ManageEvents)
    if (status && !eventName) {
      const result = await pool.query(
        'UPDATE events SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
        [status, id]
      );
      return res.json(result.rows[0]);
    }

    // Full update
    const result = await pool.query(
      `UPDATE events
       SET event_name=$1, sport=$2, description=$3, location=$4,
           date_time=$5, registration_deadline=$6, updated_at=NOW()
       WHERE id=$7
       RETURNING *`,
      [eventName, sport, description, location, dateTime, registrationDeadline, id]
    );
    res.json(result.rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
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

// PUT /api/events/:id/matches/:matchId
export const updateMatch = async (req, res, next) => {
  try {
    const { id: eventId, matchId } = req.params;

    // Only the event creator can update matches
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

// DELETE /api/events/:id/matches/:matchId
export const deleteMatch = async (req, res, next) => {
  try {
    const { id: eventId, matchId } = req.params;

    // Only the event creator can delete matches
    const eventCheck = await pool.query('SELECT created_by FROM events WHERE id = $1', [eventId]);
    if (!eventCheck.rows[0]) return res.status(404).json({ error: 'Event not found' });
    if (eventCheck.rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: 'Only the event creator can manage matches' });
    }

    await pool.query('DELETE FROM matches WHERE id=$1 AND event_id=$2', [matchId, eventId]);
    res.json({ message: 'Match deleted' });
  } catch (err) { next(err); }
};
