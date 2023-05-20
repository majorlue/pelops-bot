import {DiscordAPIError, REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {ActivityType, ChannelType, Client} from 'discord.js';
import {schedule} from 'node-cron';
import {commandHash, commandList, presenceCmds} from '../commands';
import {config, isProd} from '../config';
import {currentHeightsEmbed, leadMonsters, logger, prisma} from '../handlers';

// bot client token, for use with discord API
const BOT_TOKEN = config.BOT_TOKEN;
// interval to change bot presence (status message)
const PRESENCE_TIMER = Number(config.PRESENCE_TIMER) * 1000; // convert s to ms
// interval to update floor dislay message
const UPDATE_TIMER = Number(config.FLOOR_DISPLAY_TIMER) * 1000; // convert s to ms

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

  // cron schedule to update presence every 3 seconds
  schedule('*/3 * * * * *', () => {
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
  });

  // cron schedule to update messages every hour
  schedule('0 * * * *', async () => {
    const persistentMessages = await prisma.persistentMessage.findMany({
      where: {type: {equals: 'curr_floors'}, production: isProd},
    });

    // iterate through each one
    for (const message of persistentMessages) {
      const {messageId, channelId} = message;
      // try/catch block, handling Discord API errors appropriately
      try {
        // try fetching the channel, may throw '50001', bot can't see channel
        const messageChannel = await client.channels.fetch(channelId);
        if (messageChannel && messageChannel.type === ChannelType.GuildText) {
          // try fetching the message, may throw '10008', message doesn't exist (deleted?)
          const discordMsg = await messageChannel.messages.fetch(messageId);
          // if the message exists, then update it with the new heights
          if (discordMsg)
            await discordMsg.edit({
              embeds: [
                currentHeightsEmbed().setDescription(
                  `This message is updated every hour.`
                ),
              ],
            });
        }
      } catch (err) {
        const discordErr = err as DiscordAPIError;
        // discord API error codes
        // https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/RESPONSE_CODES.md#json-error-response
        switch (discordErr.code) {
          case 10008: // Unknown message
            await prisma.persistentMessage.delete({where: {messageId}});
            break;
          case 50001: // Missing access
            await prisma.persistentMessage.delete({where: {messageId}});
            break;
          case 50005: // Cannot edit a message authored by another user
            break;
        }
      }
    }
    logger.info(`Updated ${persistentMessages.length} persistent messages`, {
      type: 'info',
    });
  });

  logger.info(`Set presence to rotate between: ${presenceCmds.join(', ')}`, {
    type: 'startup',
  });
};

export {onReady};
