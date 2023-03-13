import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces';
import approve from './approve';
import deny from './deny';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  approve,
  deny,
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
const exclude = ['approve', 'deny', 'submissions'];
const presenceCmds = Object.keys(commandHash).filter(x => !exclude.includes(x));

export {commandHash, commandList, presenceCmds};
