import {Client} from 'discord.js';
import {onInteraction, onReady} from './events';
import {config} from './config';

// extracting required config vars
const {BOT_TOKEN} = config;

// create new discord client
const client = new Client({intents: []});

const start = async () => {
  // run startup scripts
  client.on('ready', async () => await onReady(client));

  // handle user interactions (eg. commands)
  client.on(
    'interactionCreate',
    async interaction => await onInteraction(interaction)
  );

  await client.login(BOT_TOKEN);
  console.log(`Client successfully logged in`);
};

start();

export default client;
