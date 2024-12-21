module.exports = {
  apps: [
    {
      name: "Chess App",
      script: "./dist/server/index.js",
      log_date_format: "DD-MM HH:mm:ss.SSS",
      instances: 1,
      watch: false,
      autorestart: true,
      // every 5 minutes
      restart_delay: 300000,
    },
  ],
};
