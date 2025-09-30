module.exports = {
  apps: [
    {
      name: 'fumegato-site',
      script: 'npm',
      args: 'start',
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};