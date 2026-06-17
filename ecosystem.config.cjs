const path = require('node:path');

module.exports = {
  apps: [
    {
      name: 'dao-edu-web',
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
        PM2_SERVE_PORT: process.env.FRONTEND_PORT || 5001,
        PM2_SERVE_SPA: 'true',
      },
    },
  ],
};
