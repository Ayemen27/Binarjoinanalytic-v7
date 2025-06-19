const { exec } = require('child_process');
const path = require('path');

// Start Next.js development server
const nextProcess = exec('npx next dev -p 3000', {
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development' }
});

nextProcess.stdout.on('data', (data) => {
  console.log(data);
});

nextProcess.stderr.on('data', (data) => {
  console.error(data);
});

nextProcess.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
});

console.log('Starting منصة الإشارات on http://localhost:3000');