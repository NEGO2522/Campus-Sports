import pool from './pool.js';

const seed = async () => {
  await pool.query(`
    INSERT INTO colleges (name, city, state, lat, lng) VALUES
    ('Poornima University', 'Jaipur', 'Rajasthan', 26.8887, 75.8069),
    ('Poornima College of Engineering', 'Jaipur', 'Rajasthan', 26.8900, 75.8100),
    ('Jaipur Engineering College', 'Jaipur', 'Rajasthan', 26.8754, 75.7567),
    ('MNIT Jaipur', 'Jaipur', 'Rajasthan', 26.8636, 75.8022),
    ('University of Rajasthan', 'Jaipur', 'Rajasthan', 26.9124, 75.7873),
    ('Manipal University Jaipur', 'Jaipur', 'Rajasthan', 26.8468, 75.5638),
    ('Amity University Jaipur', 'Jaipur', 'Rajasthan', 26.8466, 75.5650)
    ON CONFLICT DO NOTHING;
  `);
  console.log('✅ Seed complete — Jaipur colleges added');
  process.exit();
};

seed();