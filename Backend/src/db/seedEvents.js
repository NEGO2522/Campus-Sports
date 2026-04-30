import pool from './pool.js';

const seedEvents = async () => {
  const client = await pool.connect();
  try {
    const collegeResult = await client.query(`SELECT id FROM colleges WHERE name ILIKE '%Poornima%' LIMIT 1`);
    const collegeId = collegeResult.rows[0]?.id;
    if (!collegeId) { console.log('Poornima University not found'); process.exit(1); }

    const userResult = await client.query(`SELECT id FROM users LIMIT 1`);
    const userId = userResult.rows[0]?.id;
    if (!userId) { console.log('No user found'); process.exit(1); }

    console.log(`College ID: ${collegeId}`);
    console.log(`Creator User ID: ${userId}`);

    // First delete old fake events
    await client.query(`DELETE FROM events WHERE created_by = $1`, [userId]);
    console.log('Deleted old events');

    const events = [
      {
        event_name: 'Poornima Premier Cricket League',
        sport: 'Cricket',
        description: 'Inter-branch cricket tournament — 8 teams, round robin format. Best match of the semester!',
        location: 'Poornima University Cricket Ground',
        date_time: '2024-11-15 09:00:00',
        registration_deadline: '2024-11-10 23:59:00',
        participation_type: 'team',
        players_needed: 88,
        teams_needed: 8,
        team_size: 11,
        status: 'completed',
      },
      {
        event_name: 'Friday Football Fiesta',
        sport: 'Football',
        description: '5-a-side football tournament. Fast paced, intense. 12 teams competed, CSE won the final!',
        location: 'Main Sports Ground, Block B',
        date_time: '2024-12-20 15:00:00',
        registration_deadline: '2024-12-18 23:59:00',
        participation_type: 'team',
        players_needed: 60,
        teams_needed: 12,
        team_size: 5,
        status: 'completed',
      },
      {
        event_name: 'Badminton Battle Royale',
        sport: 'Badminton',
        description: 'Singles + doubles badminton championship. Open to all branches. 32 players participated.',
        location: 'Indoor Sports Hall, Block A',
        date_time: '2025-01-10 10:00:00',
        registration_deadline: '2025-01-07 23:59:00',
        participation_type: 'player',
        players_needed: 32,
        teams_needed: 0,
        team_size: 0,
        status: 'completed',
      },
      {
        event_name: 'Basketball Slam Dunk Showdown',
        sport: 'Basketball',
        description: '3x3 basketball tournament. 8 teams, intense knockout rounds. Great energy throughout!',
        location: 'Basketball Court, Near Hostel Block',
        date_time: '2025-02-14 14:00:00',
        registration_deadline: '2025-02-12 23:59:00',
        participation_type: 'team',
        players_needed: 24,
        teams_needed: 8,
        team_size: 3,
        status: 'completed',
      },
      {
        event_name: 'Table Tennis Open',
        sport: 'Table Tennis',
        description: 'Singles table tennis open championship. 16 players, single elimination.',
        location: 'Recreation Room, Block C',
        date_time: '2025-03-05 11:00:00',
        registration_deadline: '2025-03-03 23:59:00',
        participation_type: 'player',
        players_needed: 16,
        teams_needed: 0,
        team_size: 0,
        status: 'completed',
      },
    ];

    for (const event of events) {
      await client.query(
        `INSERT INTO events (
          event_name, sport, description, location,
          date_time, registration_deadline, participation_type,
          players_needed, teams_needed, team_size,
          college_id, created_by, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          event.event_name, event.sport, event.description, event.location,
          event.date_time, event.registration_deadline, event.participation_type,
          event.players_needed, event.teams_needed, event.team_size,
          collegeId, userId, event.status,
        ]
      );
      // NOTE: Creator is NOT inserted into event_participants.
      // Creating an event ≠ joining an event.
      console.log(`Added: ${event.event_name}`);
    }

    console.log('\nDone! 5 past events seeded (creator not auto-joined).');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    process.exit();
  }
};

seedEvents();
