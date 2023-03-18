import {SlashCommandBuilder} from '@discordjs/builders';
import {currentHeightsEmbed} from '../handlers';
import {Command} from '../interfaces/command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('floors')
    .setDescription('List current Tower floor counts.'),
  run: async interaction => {
    await interaction.editReply({embeds: [currentHeightsEmbed()]});
  },
};

export default command;
