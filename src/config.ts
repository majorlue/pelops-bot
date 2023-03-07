import {config as dotenv} from 'dotenv';
dotenv({path: process.env.ENV_PATH});

import {version} from '../package.json';

const production: boolean = process.env.NODE_ENV === 'production';

const config: Record<string, string | number | undefined> = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_EMBED_COLOUR: 'DarkPurple',
  BOT_FOOTER_MESSAGE: 'made by Major#1005',
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
