const path = require('node:path');
const { execSync } = require('child_process');

let appName = 'dao-edu-web';
let defaultPort = 5001;

try {
  const branch = execSync('git branch --show-current').toString().trim();
  if (branch === 'master') {
    appName = 'dao-edu-production-web';
    defaultPort = 5006;
  }
} catch (e) {
  // fallback
}

module.exports = {
  apps: [
    {
      name: appName,
      cwd: __dirname,
      script: 'serve',
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '256M',
      min_uptime: '10s',
      restart_delay: 3000,
      time: true,
      env_production: {
        NODE_ENV: 'production',
        PM2_SERVE_PATH: path.join(__dirname, 'dist'),
        PM2_SERVE_PORT: process.env.FRONTEND_PORT || defaultPort,
        PM2_SERVE_SPA: 'true',
      },
    },
  ],
};
