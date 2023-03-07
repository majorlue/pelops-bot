import {CommandInteraction} from 'discord.js';
import {Command} from '../interfaces/command';
import ping from './ping';
import towerFloors from './towerFloors';

const commandList: Command[] = [ping, towerFloors];

const commandHash: Record<
  string,
  (interaction: CommandInteraction) => Promise<void>
> = {};
for (const command of commandList) commandHash[command.data.name] = command.run;

export {commandHash, commandList};
