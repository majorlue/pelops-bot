import {ActivityType, Client} from 'discord.js';
import {config} from './config';
import {onInteraction, onReady} from './events';
import {logger} from './handlers';

// extracting required config vars
const {BOT_TOKEN} = config;

// create new discord client
const client = new Client({intents: []});

const start = async () => {
  // run startup scripts
  client.on('ready', async () => await onReady(client));

  // log server join and update discord presence
  client.on('guildCreate', async guild => {
    // retrieve new server count
    const serverCount = (await client.guilds.fetch()).size;
    logger.info(`Client joined guild #${serverCount}: ${guild.name}`);

    if (client.user)
      client.user.setPresence({
        activities: [
          {type: ActivityType.Listening, name: `${serverCount} servers`},
        ],
      });
  });

  // handle user interactions (eg. commands)
  client.on(
    'interactionCreate',
    async interaction => await onInteraction(interaction)
  );

  // client.user?.setPresence({activities: [{name: `Hello!`}]});
  await client.login(BOT_TOKEN);
};

start();

export default client;
