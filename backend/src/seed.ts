import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import { User, CheckIn, JournalEntry, Recommendation } from './models/index.js';
import { logger } from './utils/logger.js';

export const seedDatabase = async () => {
  logger.info('🌱 Starting MindPulse synthetic seed data generation...');
  const connected = await connectDatabase();

  const password = 'MindPulseDemo2026!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const demoUsers = [
    {
      email: 'demo.user@mindpulse.local',
      passwordHash,
      fullName: 'Alex Rivera (Student)',
      role: 'USER',
      department: 'Computer Science',
      yearOfStudy: 3,
    },
    {
      email: 'demo.counselor@mindpulse.local',
      passwordHash,
      fullName: 'Dr. Sarah Jenkins (Counselor)',
      role: 'COUNSELOR',
      department: 'Student Wellness Services',
    },
    {
      email: 'demo.admin@mindpulse.local',
      passwordHash,
      fullName: 'Dean Marcus Vance (Admin)',
      role: 'ADMIN',
      department: 'Institutional Health & Analytics',
    },
  ];

  if (connected) {
    try {
      for (const u of demoUsers) {
        await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
      }
      logger.info('✅ Successfully seeded demo users into MongoDB.');
    } catch (err: any) {
      logger.warn('Seed insert encountered error:', err.message);
    }
  } else {
    logger.info('💡 Running in demo mode: demo users are built-in and accessible without MongoDB.');
  }

  logger.info('═══════════════════════════════════════════════════════════');
  logger.info(' MindPulse Demo Credentials Ready:');
  logger.info(' • Student:   demo.user@mindpulse.local       / MindPulseDemo2026!');
  logger.info(' • Counselor: demo.counselor@mindpulse.local  / MindPulseDemo2026!');
  logger.info(' • Admin:     demo.admin@mindpulse.local      / MindPulseDemo2026!');
  logger.info('═══════════════════════════════════════════════════════════');
};

if (process.argv[1]?.includes('seed')) {
  seedDatabase().then(() => process.exit(0));
}
