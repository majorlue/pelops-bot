import {Interaction} from 'discord.js';
import {commandHash} from '../commands';

// define function for handling user interactions with the bot
const onInteraction = async (interaction: Interaction) => {
  // verify intertaction type here and run the approriate function
  if (interaction.isCommand())
    await commandHash[interaction.commandName](interaction);
};

export {onInteraction};
