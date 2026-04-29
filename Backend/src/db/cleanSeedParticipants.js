/**
 * cleanSeedParticipants.js
 *
 * One-time cleanup script.
 *
 * The seedEvents.js script accidentally inserted the creator (you) as a
 * participant in every dummy event it created. This script removes those
 * fake event_participants rows — but ONLY for events where you are also
 * the creator, so your real registrations (events you genuinely joined
 * but did NOT create) are left untouched.
 *
 * Run once:  node src/db/cleanSeedParticipants.js
 */

import pool from './pool.js';

const clean = async () => {
  const client = await pool.connect();
  try {
    // Delete rows where the same user is BOTH the event creator AND a participant.
    // Real joins: user joins someone else's event → created_by !== user_id → safe.
    const result = await client.query(`
      DELETE FROM event_participants ep
      USING events e
      WHERE ep.event_id = e.id
        AND ep.user_id  = e.created_by
    `);

    console.log(`✅ Cleanup done — ${result.rowCount} fake participant row(s) removed.`);
    console.log('   (Only rows where user = event creator were deleted.)');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
  } finally {
    client.release();
    process.exit();
  }
};

clean();
