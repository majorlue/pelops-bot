require('newrelic');

// TODO: cleanup config vars

const envVars: Record<string, string | number | undefined> = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_OWNER: process.env.BOT_OWNER || '153296359871479809',
  EMBED_COLOUR: process.env.EMBED_COLOUR || 'DarkPurple',
  FOOTER_MESSAGE: process.env.FOOTER_MESSAGE || 'made by Major#1005',
  IMAGE_PATH: 'https://orna.guide/static/orna/img/',
  CODEX_PREFIX: 'https://playorna.com',
  PRESENCE_TIMER: process.env.PRESENCE_TIMER || 10,
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
  keyFights: ['Tower Guard'],
  minHeight: 1,
  maxHeight: 49,
  minChests: 0,
  maxChests: 5,
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
export {config, towerConfig};
