import {ColorResolvable, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import {config} from '../config';
import {Command} from '../interfaces/command';

const FOOTER_MESSAGE = config.FOOTER_MESSAGE;
const EMBED_COLOUR = config.EMBED_COLOUR;
const DISCORD_INVITE = config.DISCORD_INVITE;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('discord')
    .setDescription('Pelops Discord invite'),
  run: async interaction => {
    await interaction.editReply({
      content: DISCORD_INVITE,
      embeds: [
        new EmbedBuilder()
          .setTitle('Cade Labs - Orna Research Hub')
          .setThumbnail('https://orna.guide/static/orna/img/npcs/inventor2.png')
          .setDescription(
            `Pelops is part of **Cade Labs**! ` +
              `Here you can discuss stuff, see the latest patches, submit suggestions and report bugs. ` +
              `You're also free to hang out with fellow Cade Labs people and see all the projects being worked on!` +
              `\n\n` +
              `You'll find details about Pelops (including how to add it to your server) in <#1086495607868371015> -- the channel the invite links you to.` +
              ` Thanks for your interest in the project! <3`
          )
          .setURL(DISCORD_INVITE)
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp(),
      ],
    });
  },
};

export default command;
