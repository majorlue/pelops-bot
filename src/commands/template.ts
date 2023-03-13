import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {prisma} from '../handlers';
import {Command} from '../interfaces';

const command: Command = {
  data: new SlashCommandBuilder()
    // slash command invoke
    .setName('COMMAND_NAME_HERE')
    .setDescription('COMMAND_DESCRIPTION_HERE')
    // slash command arguements
    .addStringOption(option =>
      option
        .setName('monster')
        .setDescription('Lead monster to search for')
        .setRequired(true)
        // allows bot to return automcomplete options
        // autocomplete response must be handled in 'onInteraction.ts'
        .setAutocomplete(true)
    ),
  run: async interaction => {
    // defer reply, so Discord gets the required response within 3 seconds
    await interaction.deferReply(
      // ephemeral sets command visible to only the invoker
      {ephemeral: true}
    );

    // NOTE: include command logic here

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        name: ``,
      })
      .addFields()
      .setThumbnail('')
      .setFooter({
        // the small text at the bottom
        text: FOOTER_MESSAGE,
      })
      // cute
      .setColor(config.BOT_EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    // now that processing is done, edit original message with the populated embed
    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
