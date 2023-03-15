import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces';
import admin from './admin';
import contributor from './contributor';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import set from './set';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  admin,
  contributor,
  encounter,
  floors,
  keys,
  set,
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
const contribCmds = ['set', 'submissions'];

// cycle through non-admin commands as status
const presenceCmds = Object.keys(commandHash)
  .filter(x => ![...ownerCmds, ...adminCmds].includes(x))
  .map(x => `/${x}`);

// commands to offer monster autocomplete suggestions for
const monsterAutoCmds = ['encounter', 'set', 'submit'];

export {
  commandList,
  commandHash,
  ownerCmds,
  adminCmds,
  contribCmds,
  presenceCmds,
  monsterAutoCmds,
};
