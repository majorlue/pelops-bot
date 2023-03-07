import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces/command';
import floors from './floors';
import towers from './aliases/towers';

const commandList: Command[] = [floors, towers];

const commandHash: Record<
  string,
  (interaction: CommandInteraction) => Promise<void>
> = {};
for (const command of commandList) commandHash[command.data.name] = command.run;

export {commandHash, commandList};
