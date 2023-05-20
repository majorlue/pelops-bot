import {CommandInteraction, ModalSubmitInteraction} from 'discord.js';
import {Command} from '../interfaces';
import admin from './admin';
import bulk, {bulkModal} from './bulk';
import chests from './chests';
import chestskeys from './chestskeys';
import contributor from './contributor';
import discord from './discord';
import display from './display';
import encounter from './encounter';
import floors from './floors';
import keys from './keys';
import lights from './lights';
import submissions from './submissions';
import submit from './submit';
import tower from './tower';

const commandList: Command[] = [
  admin,
  bulk,
  chests,
  chestskeys,
  display,
  contributor,
  discord,
  encounter,
  floors,
  keys,
  lights,
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

const modalHash: Record<
  string,
  (interaction: ModalSubmitInteraction) => Promise<void>
> = {
  bulk: bulkModal,
};

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
// commands to not defer/suggestion etc. instead provide a modal for further input
const modalCmds = ['bulk'];

export {
  commandList,
  commandHash,
  modalHash,
  ownerCmds,
  adminCmds,
  contribCmds,
  presenceCmds,
  monsterAutoCmds,
  modalCmds,
  ephemeralCmds,
};
