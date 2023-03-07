import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {Command} from '../interfaces/command';
import {config} from '../config';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('pong!'),
  run: async interaction => {
    await interaction.deferReply({ephemeral: true});
    const {user} = interaction;

    const responseEmbed = new EmbedBuilder()
      .setTitle('pong!')
      .setAuthor({
        name: user.tag,
        iconURL: user.displayAvatarURL(),
      })
      .setFooter({
        text: config.BOT_FOOTER_MESSAGE,
      })
      .setColor(config.BOT_EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
