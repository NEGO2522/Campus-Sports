import pool from '../db/pool.js';

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

    // Emit match update to all clients in this event room
    req.io.to(`event_${eventId}`).emit('match_updated', result.rows[0]);

    // If match is completed, emit completion event with scores
    if (status === 'completed') {
      req.io.to(`event_${eventId}`).emit('match_completed', {
        matchId,
        team1Score: team1Score || result.rows[0].team1_score,
        team2Score: team2Score || result.rows[0].team2_score
      });
    }

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
