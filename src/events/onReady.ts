import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {Client} from 'discord.js';
// Importing commandHash so it's loaded upon startup, rather than on the first command after startup
import {commandHash, commandList} from '../commands';
import {config} from '../config';
import {prisma} from '../handlers';

const leadMonsters: string[] = [];

// complete startup tasks, log time taken
const onReady = async (client: Client) => {
  const clientId = client.user?.id;
  if (!clientId) throw Error('No client ID found!');

  const rest = new REST().setToken(config.BOT_TOKEN);

  console.log(
    `Serving ${(await client.guilds.fetch()).size} servers as ${
      client.user?.tag
    }`
  );

  // register commands as global discord slash commands
  let loadTime = Date.now();
  const commandData = commandList.map(command => command.data.toJSON());
  await rest.put(Routes.applicationCommands(clientId), {
    body: commandData,
  });
  console.log(`Commands loaded: ${Object.keys(commandHash).join(', ')}`);
  console.log(
    `Loaded ${commandData.length} commands in ${Date.now() - loadTime}ms`
  );

  // retrieve encounters and load them as autocomplete suggestions
  loadTime = Date.now();
  (await prisma.encounter.findMany()).forEach(encounter =>
    leadMonsters.push(encounter.leader)
  );
  console.log(
    `Loaded ${leadMonsters.length} encounters in ${Date.now() - loadTime}ms`
  );
};
export {onReady, leadMonsters};
