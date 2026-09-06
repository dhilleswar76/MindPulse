import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('⚡ Starting MindPulse Initial Setup...');

// 1. Copy .env.example to .env if not exists
if (!fs.existsSync('.env')) {
  fs.copyFileSync('.env.example', '.env');
  console.log('📄 Created root .env from .env.example');
}

if (!fs.existsSync('backend/.env')) {
  fs.copyFileSync('.env.example', 'backend/.env');
  console.log('📄 Created backend/.env from .env.example');
}

console.log('📦 Installing npm dependencies across monorepo...');
try {
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm --prefix backend install', { stdio: 'inherit' });
  execSync('npm --prefix frontend install', { stdio: 'inherit' });
  console.log('✅ Dependencies successfully installed.');
} catch (err: any) {
  console.error('⚠️ Dependency installation warning:', err.message);
}

console.log('🎉 MindPulse setup complete! Run `npm run dev` to start all services.');
