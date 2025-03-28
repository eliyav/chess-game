module.exports = {
  apps: [
    {
      name: "Chess App",
      script: "./dist/server/index.js",
      log_date_format: "DD-MM HH:mm:ss.SSS",
      instances: 1,
      watch: false,
      autorestart: true,
      exp_backoff_restart_delay: 100
    },
  ],
};
