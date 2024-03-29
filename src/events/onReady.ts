import {DiscordAPIError, REST} from '@discordjs/rest';
import {Routes} from 'discord-api-types/v9';
import {ActivityType, ChannelType, Client} from 'discord.js';
import {schedule} from 'node-cron';
import {commandHash, commandList, presenceCmds} from '../commands';
import {config, isProd} from '../config';
import {
  currentHeightsEmbed,
  currentKeysEmbed,
  currentTowerEmbed,
  currentWeek,
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
const SUBMIT_THRESHOLD = Number(config.SUBMIT_THRESHOLD);

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

  // cron schedule to check submissions every hour on the 30 minute mark
  schedule('30 * * * *', async () => {
    let start = Date.now();
    // retrieve all of this week's submissions
    const submissions = await prisma.floorSubmission.findMany({
      where: {week: currentWeek(), resolved: false},
    });
    // iterate through them, checking if the auto-approve threshold has been reached
    for (const submission of submissions) {
      const {theme, week, user, floor, guardians, strays, puzzles, chests} =
        submission;
      // retrieve identical submissions
      const sameSubmissions = await prisma.floorSubmission.findMany({
        where: {
          tower: {theme, week},
          guardians: {hasEvery: guardians},
          strays: {hasEvery: strays},
          puzzles: {hasEvery: puzzles},
          chests: {equals: chests},
          user: {not: user},
        },
      });

      // if there's enough submissions, mark them all as approved and update floor
      if (sameSubmissions.length > SUBMIT_THRESHOLD) {
        prisma.floor.upsert({
          where: {theme_week_floor: {theme, week, floor}},
          update: {
            guardians: {set: guardians},
            strays: {set: strays},
            puzzles: {set: puzzles},
            chests: chests,
          },
          create: {
            tower: {
              connectOrCreate: {
                create: {theme, week},
                where: {theme_week: {theme, week}},
              },
            },
            floor: floor,
            guardians: guardians,
            strays: strays,
            puzzles: puzzles,
            chests: chests,
          },
        });
        // mark all existing identical submissions as approved
        prisma.floorSubmission.updateMany({
          where: {
            tower: {theme, week},
            floor: {equals: floor},
            guardians: {hasEvery: submission.guardians},
            strays: {hasEvery: submission.strays},
            puzzles: {hasEvery: submission.puzzles},
            chests: {equals: submission.chests},
            resolved: {not: false},
          },
          data: {
            approved: true,
            resolved: true,
          },
        });
        // mark remaining unresolved sumissions as denied
        prisma.floorSubmission.updateMany({
          where: {
            tower: {theme, week},
            floor: {equals: floor},
            resolved: {not: false},
          },
          data: {
            approved: false,
            resolved: true,
          },
        });
        // log the autoupdate
        logger.info(
          `Submission threshold met, auto-updated: ${week} ${theme} F${floor}`,
          {
            type: 'info',
          }
        );
      }
    }
    time = `${Date.now() - start}ms`;
    logger.info(`Checked ${submissions.length} submissions in ${time}`, {
      type: 'info',
      time,
    });
  });

  // cron schedule to update messages every hour
  schedule('0 * * * *', async () => {
    // measure time taken to update all persistent messages
    let start = Date.now();

    // persistent messages types are 'curr_floors' and 'curr_keys'
    const persistentMessages = await prisma.persistentMessage.findMany({
      where: {production: isProd, deleted: false},
    });

    const embeds = {
      curr_floors: currentHeightsEmbed().setDescription(DISPLAY_CMD_DESC),
      curr_keys: (await currentKeysEmbed()).setDescription(DISPLAY_CMD_DESC),
      curr_tower_selene: await currentTowerEmbed('Selene'),
      curr_tower_eos: await currentTowerEmbed('Eos'),
      curr_tower_oceanus: await currentTowerEmbed('Oceanus'),
      curr_tower_prometheus: await currentTowerEmbed('Prometheus'),
      curr_tower_themis: await currentTowerEmbed('Themis'),
    };

    const promises: Promise<any>[] = [];
    // iterate through each one
    for (const message of persistentMessages) {
      const {messageId, channelId} = message;
      // try/catch block, handling Discord API errors appropriately
      try {
        // try fetching the channel, may throw '50001', bot can't see channel
        const messageChannel = await client.channels.fetch(channelId);
        if (
          messageChannel &&
          (messageChannel.type === ChannelType.GuildText ||
            messageChannel.type === ChannelType.PublicThread)
        ) {
          // try fetching the message, may throw '10008', message doesn't exist (deleted?)
          const discordMsg = await messageChannel.messages.fetch(messageId);
          // if the message exists and is accessible, then update it depending on the message type
          if (discordMsg)
            switch (message.type) {
              // lively version of /floors
              case 'curr_floors':
                promises.push(
                  discordMsg.edit({
                    embeds: [embeds['curr_floors']],
                  })
                );
                break;
              // lively version of /keys
              case 'curr_keys':
                promises.push(
                  discordMsg.edit({
                    embeds: [embeds['curr_keys']],
                  })
                );
                break;
              // lively versions of /tower
              case 'curr_tower_selene':
                promises.push(
                  discordMsg.edit({
                    embeds: embeds['curr_tower_selene'],
                  })
                );
                break;
              case 'curr_tower_eos':
                promises.push(
                  discordMsg.edit({
                    embeds: embeds['curr_tower_eos'],
                  })
                );
                break;
              case 'curr_tower_oceanus':
                promises.push(
                  discordMsg.edit({
                    embeds: embeds['curr_tower_oceanus'],
                  })
                );
                break;
              case 'curr_tower_prometheus':
                promises.push(
                  discordMsg.edit({
                    embeds: embeds['curr_tower_prometheus'],
                  })
                );
                break;
              case 'curr_tower_themis':
                promises.push(
                  discordMsg.edit({
                    embeds: embeds['curr_tower_themis'],
                  })
                );
                break;
            }
        }
      } catch (err) {
        const discordErr = err as DiscordAPIError;
        // discord API error codes
        // https://github.com/meew0/discord-api-docs-1/blob/master/docs/topics/RESPONSE_CODES.md#json-error-response
        switch (discordErr.code) {
          case 10003: // Unknown channel
            promises.push(
              prisma.persistentMessage.update({
                where: {messageId},
                data: {deleted: true},
              })
            );
            break;
          case 10008: // Unknown message
            promises.push(
              prisma.persistentMessage.update({
                where: {messageId},
                data: {deleted: true},
              })
            );
            break;
          case 50001: // Missing access
            promises.push(
              prisma.persistentMessage.update({
                where: {messageId},
                data: {deleted: true},
              })
            );
            break;
          case 50005: // Cannot edit a message authored by another user
            break;
        }
      }
    }

    // await all message edits completion
    await Promise.all(promises);
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
