import {SlashCommandBuilder} from '@discordjs/builders';
import {
  ChannelType,
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import {config} from '../config';
import {
  client,
  currentHeightsEmbed,
  missingChannelPerms,
  prisma,
  sleep,
} from '../handlers';
import {Command} from '../interfaces/command';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('display')
    .setDescription('Returns messages viewable by all users')
    .addSubcommand(subcommand =>
      subcommand
        .setName('floors')
        .setDescription('Display lively updated floor heights')
    ),
  run: async interaction => {
    const subcommand = interaction.options.data[0].name;

    if (interaction.guild) {
      const user = await interaction.guild.members.fetch(interaction.user.id);
      if (!user.permissions.has('ManageMessages')) {
        // respond with missing perms, then delete the response after 5s
        await interaction.editReply(missingChannelPerms(interaction));
        await sleep(5000);
        await interaction.deleteReply();
        return;
      }
    }

    await subcmds[subcommand](interaction);
  },
};

const subcmds: {[key: string]: (job: CommandInteraction) => Promise<void>} = {
  floors: floors,
};

async function floors(interaction: CommandInteraction) {
  const message = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Testing Permissions...`)
        .setDescription('Checking if this can be updated in the future...')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  });

  // try to update interaction reply via message API to check permissions
  try {
    const messageChannel = await client.channels.fetch(message.channelId);
    if (messageChannel && messageChannel.type === ChannelType.GuildText) {
      const discordMsg = await messageChannel.messages.fetch(message.id);
      if (discordMsg)
        await discordMsg.edit({
          embeds: [
            currentHeightsEmbed().setDescription(
              `Message updates as heights change`
            ),
          ],
        });
    }

    // if edit succeeds, then create db entry to update the message in future
    await prisma.persistentMessage.create({
      data: {
        channelId: message.channelId,
        messageId: message.id,
        type: 'curr_floors',
      },
    });
    // API throws noaccess err if bot doesn't have perms for the channel
    // update interaction reply to reflect that, then remove it 10s later
  } catch (err) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: interaction.user.tag,
            iconURL: interaction.user.avatarURL() || '',
          })
          .setTitle(`Missing Permissions`)
          .setDescription(
            'Pelops requires channel access to update this message later!'
          )
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp(),
      ],
    });
    await sleep(10000);
    await interaction.deleteReply();
  }
}

export default command;
