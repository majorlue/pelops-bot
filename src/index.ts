import {Client, GatewayIntentBits} from 'discord.js';
import {config} from './config';
import {onInteraction, onReady} from './events';
import {logger} from './handlers';

// extracting required config vars
const {BOT_TOKEN} = config;

// create new discord client
const client = new Client({intents: [GatewayIntentBits.Guilds]});

const start = async () => {
  // run startup scripts
  client.on('ready', async () => await onReady(client));

  // log server join
  client.on('guildCreate', async guild => {
    // first check if server is experiencing an outtage
    if (guild.available) {
      // retrieve new server count
      const serverCount = (await client.guilds.fetch()).size;
      logger.info(`Client joined guild #${serverCount}: ${guild.name}`);
    }
  });

  // log server kick
  client.on('guildDelete', guild => {
    if (guild.available) logger.info(`Client removed from: ${guild.name}`);
  });

  // handle user interactions (eg. commands)
  client.on(
    'interactionCreate',
    async interaction => await onInteraction(interaction)
  );

  await client.login(BOT_TOKEN);
};

start();

export default client;
