require('newrelic');

const production: boolean = process.env.NODE_ENV === 'production';

const config: Record<string, string | number | undefined> = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_EMBED_COLOUR: 'DarkPurple',
  BOT_FOOTER_MESSAGE: 'made by Major#1005',
  ORNAGUIDE_IMAGE_PREFIX: 'https://orna.guide/static/orna/img/',
  CODEX_PREFIX: 'https://playorna.com',
};

const assertedConfig: Record<string, string> = {};
// assert all env vars as non-null and populate config with only strings
Object.keys(config).forEach(key => {
  const value = config[key];
  if (value === undefined)
    throw new Error(`${key} environment variable required!`);

  assertedConfig[key] = value as string;
});

// export config var
export {assertedConfig as config, production};
