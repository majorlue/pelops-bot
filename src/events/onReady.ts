import {REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {Client} from 'discord.js';
// Importing commandHash so it's loaded upon startup, rather than on the first command after startup
import {commandList, commandHash} from '../commands';
import {config} from '../config';

const BOT_TOKEN = config.BOT_TOKEN;

const onReady = async (client: Client) => {
  const clientId = client.user?.id;
  if (!clientId) throw Error('No client ID found!');

  const rest = new REST().setToken(config.BOT_TOKEN);

  const commandData = commandList.map(command => command.data.toJSON());
  await rest.put(Routes.applicationCommands(clientId), {
    body: commandData,
  });

  console.log(
    `Loaded ${commandData.length} commands: ${Object.keys(commandHash)}`
  );
};

export {onReady};
