const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWin = process.platform === 'win32';
const venvPyWin = path.join(__dirname, '..', 'ml-service', '.venv', 'Scripts', 'python.exe');
const venvPyUnix = path.join(__dirname, '..', 'ml-service', '.venv', 'bin', 'python');

let pyExec = 'python';
if (isWin && fs.existsSync(venvPyWin)) {
  pyExec = venvPyWin;
} else if (!isWin && fs.existsSync(venvPyUnix)) {
  pyExec = venvPyUnix;
} else if (isWin) {
  pyExec = 'py';
}

console.log(`[ML-SERVICE] Launching with Python executable: ${pyExec}`);

const child = spawn(pyExec, ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000'], {
  cwd: path.join(__dirname, '..', 'ml-service'),
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
