module.exports = {
  apps: [
    {
      name: 'bot',
      script: './build/src/index.js',
      exec_mode: 'fork',
    },
  ],
};
