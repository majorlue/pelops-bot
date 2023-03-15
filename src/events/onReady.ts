import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {ActivityType, Client} from 'discord.js';
import {commandHash, commandList, presenceCmds} from '../commands';
import {config} from '../config';
import {leadMonsters, logger} from '../handlers';

// bot client token, for use with discord API
const BOT_TOKEN = config.BOT_TOKEN;
// interval to change bot presence (status message)
const PRESENCE_TIMER = Number(config.PRESENCE_TIMER) * 1000; // convert s to ms

// complete startup tasks, log time taken
const onReady = async (client: Client) => {
  if (!client.user) throw Error('Client not found');
  const clientId = client.user.id;
  const serverCount = (await client.guilds.fetch()).size;

  const rest = new REST().setToken(BOT_TOKEN);

  logger.info(`Serving ${serverCount} servers as ${client.user?.tag}`, {
    type: 'startup',
  });

  // two non-constant value for timing functions
  let start = Date.now();
  let time = '';

  // register commands as global discord slash commands
  const commandData = commandList.map(command => command.data.toJSON());
  await rest.put(Routes.applicationCommands(clientId), {
    body: commandData,
  });
  logger.info(`Commands loaded: ${Object.keys(commandHash).join(', ')}`, {
    type: 'startup',
  });
  time = `${Date.now() - start}ms`;
  logger.info(`Loaded ${commandData.length} commands in ${time}`, {
    type: 'startup',
    time,
  });

  start = Date.now();

  // retrieve encounters and load them as autocomplete suggestions
  time = `${Date.now() - start}ms`;
  logger.info(`Loaded ${(await leadMonsters).length} encounters in ${time}`, {
    type: 'startup',
    time,
  });

  setInterval(() => {
    if (client.user) {
      if (client.user.presence.activities[0]) {
        const prev = client.user.presence.activities[0].name;
        client.user.setActivity(presenceCmds.shift() as string, {
          type: ActivityType.Listening,
        });
        presenceCmds.push(prev);
      } else
        client.user.setActivity(presenceCmds.shift() as string, {
          type: ActivityType.Listening,
        });
    }
  }, PRESENCE_TIMER);

  logger.info(`Set presence to rotate between: ${presenceCmds.join(', ')}`, {
    type: 'startup',
  });
};

export {onReady};
