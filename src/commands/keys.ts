import {SlashCommandBuilder} from '@discordjs/builders';
import {currentKeysEmbed} from '../handlers';
import {Command} from '../interfaces';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('keys')
    .setDescription('Retrieve floors containing key encounters'),
  run: async interaction => {
    await interaction.editReply({embeds: [await currentKeysEmbed()]});
  },
};

export default command;
