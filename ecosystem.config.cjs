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
        PM2_SERVE_PATH: 'dist',
        PM2_SERVE_PORT: process.env.FRONTEND_PORT || 4173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: './index.html',
      },
    },
  ],
};
