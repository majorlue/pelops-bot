import {Job} from 'bull';
import {ChannelType} from 'discord.js';
import {client, currentHeightsEmbed, logger, prisma} from '../../handlers';

export async function updateFloorsMessages(job: Job): Promise<void> {
  // ensure discord client is instantiated as its required for this cron
  if (!client.isReady())
    logger.info(`Cron job ${job.name} skipped, client not ready`, {
      type: 'cron',
    });

  // retrieve messages that are to be lively updated
  const persistentMessages = await prisma.persistentMessage.findMany({
    where: {type: {equals: 'curr_floors'}},
  });

  // iterate through each one, updating it if it still exists
  for (const message of persistentMessages) {
    const {messageId, channelId} = message;
    const messageChannel = await client.channels.fetch(channelId);

    if (messageChannel && messageChannel.type === ChannelType.GuildText) {
      const discordMsg = messageChannel.messages.cache.get(messageId);
      // if the message exists, then update it with the new heights
      if (discordMsg) await discordMsg.edit({embeds: [currentHeightsEmbed()]});
      // if the message wasn't found remove from db so it won't update in the future
      else await prisma.persistentMessage.delete({where: {id: message.id}});
    }
    // if the channel wasn't found remove from db so it won't update in the future
    else await prisma.persistentMessage.delete({where: {id: message.id}});
  }
}
