import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces';
import contributor from './contributor';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  contributor,
  encounter,
  floors,
  keys,
  submissions,
  submit,
  tower,
];

const commandHash: Record<
  string,
  (interaction: CommandInteraction) => Promise<void>
> = {};
for (const command of commandList) commandHash[command.data.name] = command.run;

// create array of commands to cycle through as status
const exclude = ['contributor', 'submissions'];
const presenceCmds = Object.keys(commandHash).filter(x => !exclude.includes(x));

export {commandHash, commandList, presenceCmds};
