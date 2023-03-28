import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces';
import admin from './admin';
import chests from './chests';
import chestskeys from './chestskeys';
import contributor from './contributor';
import discord from './discord';
import display from './display';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  admin,
  chests,
  chestskeys,
  display,
  contributor,
  discord,
  encounter,
  floors,
  keys,
  submissions,
  submit,
  tower,
];

const notEphemeral = ['display'];
const ephemeralCmds = commandList
  .map(x => x.data.name)
  .filter(x => !notEphemeral.includes(x));

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
  ephemeralCmds,
};
