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

    await client.query(`DELETE FROM events WHERE created_by = $1`, [userId]);
    console.log('Deleted old events');

    const events = [
      // ── PAST OFFICIAL EVENTS ─────────────────────────────────────────────
      {
        event_name: 'Poornima Premier Cricket League',
        sport: 'Cricket',
        description: 'Inter-branch cricket tournament — 8 teams, round robin format. Best match of the semester!',
        location: 'Poornima University Cricket Ground',
        date_time: '2024-11-15 09:00:00',
        registration_deadline: '2024-11-10 23:59:00',
        participation_type: 'team',
        players_needed: 88, teams_needed: 8, team_size: 11,
        status: 'completed', event_type: 'official',
      },
      {
        event_name: 'Friday Football Fiesta',
        sport: 'Football',
        description: '5-a-side football tournament. Fast paced, intense. 12 teams competed, CSE won the final!',
        location: 'Main Sports Ground, Block B',
        date_time: '2024-12-20 15:00:00',
        registration_deadline: '2024-12-18 23:59:00',
        participation_type: 'team',
        players_needed: 60, teams_needed: 12, team_size: 5,
        status: 'completed', event_type: 'official',
      },
      {
        event_name: 'Badminton Battle Royale',
        sport: 'Badminton',
        description: 'Singles + doubles badminton championship. Open to all branches. 32 players participated.',
        location: 'Indoor Sports Hall, Block A',
        date_time: '2025-01-10 10:00:00',
        registration_deadline: '2025-01-07 23:59:00',
        participation_type: 'player',
        players_needed: 32, teams_needed: 0, team_size: 0,
        status: 'completed', event_type: 'official',
      },
      {
        event_name: 'Basketball Slam Dunk Showdown',
        sport: 'Basketball',
        description: '3x3 basketball tournament. 8 teams, intense knockout rounds. Great energy throughout!',
        location: 'Basketball Court, Near Hostel Block',
        date_time: '2025-02-14 14:00:00',
        registration_deadline: '2025-02-12 23:59:00',
        participation_type: 'team',
        players_needed: 24, teams_needed: 8, team_size: 3,
        status: 'completed', event_type: 'official',
      },
      {
        event_name: 'Table Tennis Open',
        sport: 'Table Tennis',
        description: 'Singles table tennis open championship. 16 players, single elimination.',
        location: 'Recreation Room, Block C',
        date_time: '2025-03-05 11:00:00',
        registration_deadline: '2025-03-03 23:59:00',
        participation_type: 'player',
        players_needed: 16, teams_needed: 0, team_size: 0,
        status: 'completed', event_type: 'official',
      },
      // ── UPCOMING OFFICIAL EVENTS ─────────────────────────────────────────
      {
        event_name: 'Inter-College Volleyball Championship',
        sport: 'Volleyball',
        description: 'Annual inter-college volleyball championship. 6 colleges, round robin + knockout. Register your team now!',
        location: 'Poornima University Volleyball Court',
        date_time: '2026-06-15 10:00:00',
        registration_deadline: '2026-06-10 23:59:00',
        participation_type: 'team',
        players_needed: 36, teams_needed: 6, team_size: 6,
        status: 'upcoming', event_type: 'official',
      },
      {
        event_name: 'Annual Athletics Meet 2026',
        sport: 'Athletics',
        description: 'Track and field events — 100m, 200m, 400m, relay, long jump, high jump. Open to all students.',
        location: 'Poornima University Athletic Track',
        date_time: '2026-07-05 08:00:00',
        registration_deadline: '2026-06-30 23:59:00',
        participation_type: 'player',
        players_needed: 60, teams_needed: 0, team_size: 0,
        status: 'upcoming', event_type: 'official',
      },
      // ── UPCOMING COMMUNITY PICKUP EVENTS ────────────────────────────────
      {
        event_name: 'Sunday Morning Football Pickup',
        sport: 'Football',
        description: 'Casual 7-a-side pickup game. All skill levels welcome! Just show up and play.',
        location: 'Main Ground, Block B',
        date_time: '2026-05-10 07:00:00',
        registration_deadline: '2026-05-09 23:59:00',
        participation_type: 'player',
        players_needed: 14, teams_needed: 0, team_size: 0,
        status: 'upcoming', event_type: 'community',
      },
      {
        event_name: 'Evening Basketball Run',
        sport: 'Basketball',
        description: 'Evening pickup basketball — 5v5 half court. Come after classes, bring water!',
        location: 'Basketball Court, Near Hostel Block',
        date_time: '2026-05-12 18:00:00',
        registration_deadline: '2026-05-12 17:00:00',
        participation_type: 'player',
        players_needed: 10, teams_needed: 0, team_size: 0,
        status: 'upcoming', event_type: 'community',
      },
      // ── PAST COMMUNITY PICKUP EVENTS ────────────────────────────────────
      {
        event_name: 'Weekend Cricket Gully Style',
        sport: 'Cricket',
        description: 'Casual gully cricket — tape ball, 6-a-side. Was a blast, 18 players showed up!',
        location: 'Parking Area, Block D',
        date_time: '2025-04-06 16:00:00',
        registration_deadline: '2025-04-05 23:59:00',
        participation_type: 'player',
        players_needed: 18, teams_needed: 0, team_size: 0,
        status: 'completed', event_type: 'community',
      },
      {
        event_name: 'Badminton Doubles Pickup',
        sport: 'Badminton',
        description: 'Casual doubles badminton session. 8 players, 4 pairs, round robin format.',
        location: 'Indoor Sports Hall, Block A',
        date_time: '2025-04-20 17:00:00',
        registration_deadline: '2025-04-19 23:59:00',
        participation_type: 'player',
        players_needed: 8, teams_needed: 0, team_size: 0,
        status: 'completed', event_type: 'community',
      },
    ];

    for (const event of events) {
      await client.query(
        `INSERT INTO events (
          event_name, sport, description, location,
          date_time, registration_deadline, participation_type,
          players_needed, teams_needed, team_size,
          college_id, created_by, status, event_type
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [
          event.event_name, event.sport, event.description, event.location,
          event.date_time, event.registration_deadline, event.participation_type,
          event.players_needed, event.teams_needed, event.team_size,
          collegeId, userId, event.status, event.event_type,
        ]
      );
      console.log(`Added: ${event.event_name} [${event.event_type} / ${event.status}]`);
    }

    console.log('\nDone! 11 events seeded.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    process.exit();
  }
};

seedEvents();
