import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces';
import admin from './admin';
import contributor from './contributor';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  admin,
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

// elevated commands -- not for base users
const ownerCmds = ['admin'];
const adminCmds = ['contributor'];
const contribCmds = ['submissions'];

// cycle through non-admin commands as status
const presenceCmds = Object.keys(commandHash).filter(
  x => ![...ownerCmds, ...adminCmds, ...contribCmds].includes(x)
);

export {
  commandList,
  commandHash,
  ownerCmds,
  adminCmds,
  contribCmds,
  presenceCmds,
};
