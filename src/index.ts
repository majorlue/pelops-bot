import {Client, ClientOptions} from 'discord.js';
import {config} from './config';
import {prisma} from './handlers';

const token = config.TOKEN;

console.log('Bot is starting...');

const client = new Client({
  intents: [],
});
client.login(token);
