module.exports = {
  apps: [
    {
      name: 'bot',
      script: './build/src/index.js',
      exec_mode: 'fork',
    },
    {
      name: 'worker',
      script: './build/src/worker.js',
      exec_mode: 'fork',
    },
  ],
};
