import {DiscordAPIError, REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {ActivityType, ChannelType, Client} from 'discord.js';
import {schedule} from 'node-cron';
import {commandHash, commandList, presenceCmds} from '../commands';
import {config, isProd} from '../config';
import {
  currentHeightsEmbed,
  currentKeysEmbed,
  leadMonsters,
  logger,
  prisma,
} from '../handlers';

// bot client token, for use with discord API
const BOT_TOKEN = config.BOT_TOKEN;
// interval to change bot presence (status message)
const PRESENCE_TIMER = Number(config.PRESENCE_TIMER) * 1000; // convert s to ms
// interval to update floor dislay message
const UPDATE_TIMER = Number(config.FLOOR_DISPLAY_TIMER) * 1000; // convert s to ms
// embed description for embed outputed and updated for /display
const DISPLAY_CMD_DESC = config.DISPLAY_CMD_DESC;

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
    // measure time taken to update all persistent messages
    let start = Date.now();

    // persistent messages types are 'curr_floors' and 'curr_keys'
    const persistentMessages = await prisma.persistentMessage.findMany({
      where: {production: isProd},
    });

    // iterate through each one
    for (const message of persistentMessages) {
      const {messageId, channelId} = message;
      // try/catch block, handling Discord API errors appropriately
      try {
        // retrieve the message's channel first
        client.channels.fetch(channelId).then(channel => {
          if (channel && channel.type === ChannelType.GuildText)
            // if the channel exists, and it's a guild text channel, then retrieve the message by message id
            channel.messages.fetch(messageId).then(discordMsg => {
              // if the message exists, update the message based on the type of persistent message
              if (discordMsg)
                switch (message.type) {
                  // lively version of /floors
                  case 'curr_floors':
                    discordMsg.edit({
                      embeds: [
                        currentHeightsEmbed().setDescription(DISPLAY_CMD_DESC),
                      ],
                    });
                    break;
                  // lively version of /keys
                  case 'curr_keys':
                    currentKeysEmbed().then(embed => {
                      discordMsg.edit({
                        embeds: [embed.setDescription(DISPLAY_CMD_DESC)],
                      });
                    });

                    break;
                }
            });
        });
      } catch (err) {
        const discordErr = err as DiscordAPIError;
        // discord API error codes
        // https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/RESPONSE_CODES.md#json-error-response
        switch (discordErr.code) {
          case 10008: // Unknown message
            prisma.persistentMessage.delete({where: {messageId}});
            break;
          case 50001: // Missing access
            prisma.persistentMessage.delete({where: {messageId}});
            break;
          case 50005: // Cannot edit a message authored by another user
            break;
        }
      }
    }

    time = `${Date.now() - start}ms`;
    logger.info(
      `Updated ${persistentMessages.length} persistent messages in ${time}`,
      {
        type: 'info',
        time,
      }
    );
  });

  logger.info(`Set presence to rotate between: ${presenceCmds.join(', ')}`, {
    type: 'startup',
  });
};

export {onReady};
