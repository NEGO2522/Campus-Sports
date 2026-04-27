import pool from './pool.js';

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL DEFAULT 'Rajasthan',
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id VARCHAR(200) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(200),
        phone VARCHAR(20),
        age INTEGER,
        gender VARCHAR(20),
        registration_number VARCHAR(100),
        course_name VARCHAR(200),
        college_id UUID REFERENCES colleges(id),
        sport_preferences TEXT[],
        points INTEGER DEFAULT 0,
        profile_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_name VARCHAR(200) NOT NULL,
        sport VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(500) NOT NULL,
        lat DECIMAL(10, 8),
        lng DECIMAL(11, 8),
        college_id UUID REFERENCES colleges(id),
        date_time TIMESTAMPTZ NOT NULL,
        registration_deadline TIMESTAMPTZ NOT NULL,
        participation_type VARCHAR(20) DEFAULT 'player',
        players_needed INTEGER DEFAULT 10,
        teams_needed INTEGER DEFAULT 2,
        team_size INTEGER DEFAULT 5,
        status VARCHAR(20) DEFAULT 'upcoming',
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        leader_id UUID REFERENCES users(id),
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        points INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        team_id UUID REFERENCES teams(id),
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(event_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        round VARCHAR(100),
        team1_id UUID REFERENCES teams(id),
        team2_id UUID REFERENCES teams(id),
        team1_score INTEGER DEFAULT 0,
        team2_score INTEGER DEFAULT 0,
        winner_id UUID REFERENCES teams(id),
        location VARCHAR(500),
        match_date TIMESTAMPTZ,
        status VARCHAR(20) DEFAULT 'scheduled',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(200),
        message TEXT,
        event_id UUID REFERENCES events(id) ON DELETE SET NULL,
        team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        event_id UUID REFERENCES events(id) ON DELETE CASCADE,
        inviter_id UUID REFERENCES users(id),
        invitee_id UUID REFERENCES users(id),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_id, invitee_id)
      );
    `);

    // Indexes for fast queries (location-based filtering)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_college ON events(college_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_college ON users(college_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_participants_event ON event_participants(event_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);`);

    await client.query('COMMIT');
    console.log('✅ Database migration complete. All tables created.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    process.exit();
  }
};

migrate();