import {Client, GatewayIntentBits} from 'discord.js';

// create new discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

export {client};
