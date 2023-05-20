require('newrelic');

import {version} from '../package.json';
const isProd = process.env.NODE_ENV === 'production';
// TODO: explain each config setting and section in more detail
const envVars: Record<string, string | number | undefined> = {
  // Bot Config
  BOT_TOKEN: process.env.BOT_TOKEN,
  PRESENCE_TIMER: process.env.PRESENCE_TIMER || 5,
  FLOOR_DISPLAY_TIMER: process.env.FLOOR_DISPLAY_TIMER || 900,
  BOT_OWNER: process.env.BOT_OWNER || '153296359871479809',
  ERROR_CHANNEL: isProd ? '1090705284646842488' : '376942095711338496',

  // Bot Commands
  EMBED_COLOUR: process.env.EMBED_COLOUR || 'DarkPurple',
  FOOTER_MESSAGE:
    `Bug reports and suggestions welcomed in Discord!\n` +
    `/discord | v${version} | made by Major#1005`,
  SUBMIT_THRESHOLD: process.env.SUBMIT_THRESHOLD || 3,
  IMAGE_PATH: 'https://orna.guide/static/orna/img/',
  CODEX_PREFIX: 'https://playorna.com',
  DISCORD_INVITE: 'https://discord.gg/qsWtkwj6Yg',
  LIGHTS_SOLVER: 'https://ornalightsapi.azurewebsites.net/upload',

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // Task Queue
  MAIN_QUEUE_NAME: 'background-tasks',
  CRON_QUEUE_NAME: 'cron-tasks',
  QUEUE_MAX_TRIES: process.env.QUEUE_MAX_TRIES || 3,

  // Project Info
  VERSION: version,
};

const config: Record<string, string> = {};
// assert all env vars as non-null and populate config with only strings
Object.keys(envVars).forEach(key => {
  const value = envVars[key];
  if (value === undefined)
    throw new Error(`${key} environment variable required!`);

  config[key] = value as string;
});

const towerConfig = {
  themes: ['Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis'],
  towerSprites: {
    Selene: 'https://orna.guide/static/orna/img/towers/5_3.png',
    Eos: 'https://orna.guide/static/orna/img/towers/4_3.png',
    Oceanus: 'https://orna.guide/static/orna/img/towers/3_3.png',
    Prometheus: 'https://orna.guide/static/orna/img/towers/1_3.png',
    Themis: 'https://orna.guide/static/orna/img/towers/2_3.png',
  },
  puzzleSprites: {
    lights: 'https://orna.guide/static/orna/img/towers/puzzle_door__switch.png',
    rings: 'https://orna.guide/static/orna/img/towers/puzzle_door__celtic.png',
    lock: 'https://orna.guide/static/orna/img/towers/puzzle_door.png',
  },
  keyFights: ['Tower Guard'],
  minHeight: 1,
  maxHeight: 49,
  maxChests: 5,
  maxGuardians: 4,
  maxStrays: 5,
  maxPuzzles: 3,
  puzzles: {
    lights: [1, 2, 3],
    rings: [1],
    lock: [1, 2, 3],
  },
  chestContents: [
    'Puzzle Key',

    'Att+',
    'Mag+',
    'Def+',
    'Res+',
    'Dex+',
    'Crit+',

    'Foresight+',
    'Foresight++',
    'T. Earth Immune',
    'T. Fire Immune',
    'T. Lightning Immune',
    'T. Water Immune',
    'T. Holy Immune',
    'T. Dark Immune',

    'T. All+',
    'T. Att++',
    'T. Mag++',
    'T. Def++',
    'T. Res++',
  ],
};

// export config var
export {config, towerConfig, isProd};
