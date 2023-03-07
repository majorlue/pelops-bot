import {SlashCommandBuilder} from '@discordjs/builders';
import {Command} from '../../interfaces/command';
import floors from '../floors';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('towers')
    .setDescription('List current Tower floor counts. (alias)'),
  run: floors.run,
};

export default command;
