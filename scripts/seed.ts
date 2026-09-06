import { spawn } from 'child_process';
import path from 'path';

console.log('🚀 Running MindPulse Database & Demo Seeder...');

const proc = spawn('npm', ['--prefix', 'backend', 'run', 'seed'], {
  stdio: 'inherit',
  shell: true,
});

proc.on('close', (code) => {
  if (code === 0) {
    console.log('✨ MindPulse Seed finished successfully.');
  } else {
    console.error(`Seed process exited with code ${code}`);
  }
});
