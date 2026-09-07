import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/db.js';
import { User, Case, CheckIn, JournalEntry, Recommendation } from './models/index.js';
import { logger } from './utils/logger.js';

export const seedDatabase = async () => {
  logger.info('🌱 Starting MindPulse synthetic seed data generation (SIH26094)...');
  const connected = await connectDatabase();

  const password = 'MindPulseDemo2026!';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const demoUsers = [
    {
      email: 'demo.user@mindpulse.local',
      passwordHash,
      fullName: 'Alex Rivera (Protected Witness)',
      role: 'USER',
      victimType: 'WITNESS',
      caseId: 'MP-1042',
      caseStage: 'COURT_TRIAL',
      district: 'Central District',
      state: 'National Capital Region',
      assignedCounselor: 'Dr. Sarah Jenkins',
      supportStatus: 'ACTIVE_MONITORING',
      consentStatus: true,
    },
    {
      email: 'demo.counselor@mindpulse.local',
      passwordHash,
      fullName: 'Dr. Sarah Jenkins (Designated Counselor)',
      role: 'COUNSELOR',
      district: 'Central District',
      state: 'National Capital Region',
    },
    {
      email: 'demo.admin@mindpulse.local',
      passwordHash,
      fullName: 'Marcus Vance (District Welfare Official)',
      role: 'ADMIN',
      district: 'Central District',
      state: 'National Capital Region',
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
  logger.info(' MindPulse SIH26094 Demo Credentials Ready:');
  logger.info(' • Victim/Witness: demo.user@mindpulse.local       / MindPulseDemo2026!');
  logger.info(' • Counselor:      demo.counselor@mindpulse.local  / MindPulseDemo2026!');
  logger.info(' • Admin/Official: demo.admin@mindpulse.local      / MindPulseDemo2026!');
  logger.info('═══════════════════════════════════════════════════════════');
};

if (process.argv[1]?.includes('seed')) {
  seedDatabase().then(() => process.exit(0));
}
