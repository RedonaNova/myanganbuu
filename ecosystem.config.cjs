// PM2 process file. Started/reloaded by .github/workflows/deploy.yml:
//   pm2 startOrReload ecosystem.config.cjs --update-env
module.exports = {
  apps: [
    {
      name: "myanganbuu",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 4000 -H 127.0.0.1",
      // One instance: the in-memory cache and rate limits assume a single process.
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "700M",
      kill_timeout: 10000,
      time: true,
    },
  ],
};
