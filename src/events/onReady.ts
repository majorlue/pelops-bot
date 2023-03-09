import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {ActivityType, Client} from 'discord.js';
// Importing commandHash so it's loaded upon startup, rather than on the first command after startup
import {commandHash, commandList} from '../commands';
import {config} from '../config';
import {logger, prisma} from '../handlers';

const leadMonsters: string[] = [];

// complete startup tasks, log time taken
const onReady = async (client: Client) => {
  if (!client.user) throw Error('Client not found');
  const clientId = client.user.id;
  const serverCount = (await client.guilds.fetch()).size;

  const rest = new REST().setToken(config.BOT_TOKEN);

  logger.info(`Serving ${serverCount} servers as ${client.user?.tag}`);

  // register commands as global discord slash commands
  let loadTime = Date.now();
  const commandData = commandList.map(command => command.data.toJSON());
  await rest.put(Routes.applicationCommands(clientId), {
    body: commandData,
  });
  logger.info(`Commands loaded: ${Object.keys(commandHash).join(', ')}`);
  logger.info(
    `Loaded ${commandData.length} commands in ${Date.now() - loadTime}ms`
  );

  // retrieve encounters and load them as autocomplete suggestions
  loadTime = Date.now();
  (await prisma.encounter.findMany()).forEach(encounter =>
    leadMonsters.push(encounter.leader)
  );
  logger.info(
    `Loaded ${leadMonsters.length} encounters in ${Date.now() - loadTime}ms`
  );

  client.user.setPresence({
    activities: [
      {type: ActivityType.Listening, name: `${serverCount} servers`},
    ],
  });
};

export {onReady, leadMonsters};
