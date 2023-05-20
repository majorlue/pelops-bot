import {SlashCommandBuilder} from '@discordjs/builders';
import {
  ChannelType,
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import {config, isProd} from '../config';
import {
  client,
  currentHeightsEmbed,
  currentKeysEmbed,
  missingChannelPerms,
  prisma,
  sleep,
} from '../handlers';
import {Command} from '../interfaces/command';

const {FOOTER_MESSAGE, EMBED_COLOUR, DISPLAY_CMD_DESC} = config;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('display')
    .setDescription('Returns messages viewable by all users')
    .addSubcommand(subcommand =>
      subcommand
        .setName('floors')
        .setDescription('Display lively updated floor heights')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('keys')
        .setDescription('Display lively updated key encounters')
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
  keys: keys,
};

async function floors(interaction: CommandInteraction) {
  const message = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(`Testing Permissions...`)
        .setDescription(
          'Checking if this can be updated in the future...\n\n' +
            'If this message does not change, then Pelops is missing the following permissions:\n' +
            '- View Channel\n' +
            '- Embed Links'
        )
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
          embeds: [currentHeightsEmbed().setDescription(DISPLAY_CMD_DESC)],
        });
    }

    // if edit succeeds, then create db entry to update the message in future
    await prisma.persistentMessage.create({
      data: {
        channelId: message.channelId,
        messageId: message.id,
        userId: interaction.user.id,
        guildId: message.guild?.id || '',
        production: isProd,
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
            iconURL: interaction.user.avatarURL() || undefined,
          })
          .setTitle(`Missing Permissions`)
          .setDescription(
            'Pelops requires `View Channel` and `Embed Link` permissions for this command!'
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

async function keys(interaction: CommandInteraction) {
  const message = await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(`Testing Permissions...`)
        .setDescription(
          'Checking if this can be updated in the future...\n\n' +
            'If this message does not change, then Pelops is missing the following permissions:\n' +
            '- View Channel\n' +
            '- Embed Links'
        )
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
          embeds: [(await currentKeysEmbed()).setDescription(DISPLAY_CMD_DESC)],
        });
    }

    // if edit succeeds, then create db entry to update the message in future
    await prisma.persistentMessage.create({
      data: {
        channelId: message.channelId,
        messageId: message.id,
        userId: interaction.user.id,
        guildId: message.guild?.id || '',
        production: isProd,
        type: 'curr_keys',
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
            iconURL: interaction.user.avatarURL() || undefined,
          })
          .setTitle(`Missing Permissions`)
          .setDescription(
            'Pelops requires `View Channel` and `Embed Link` permissions for this command!'
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
