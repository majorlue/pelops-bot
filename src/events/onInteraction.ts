import {Interaction} from 'discord.js';
import {go as search} from 'fuzzysort';
import {commandHash} from '../commands';
import {leadMonsters} from './onReady';

// define fuzzy search options
const searchOpts = {
  all: true, // if search empty, return all options
  limit: 25, // limit results to 25
  threshold: -1000, // don't return bad matches
};

// TODO: clean up, consider hash or something instead of if/else per cmd
// define function for handling user interactions with the bot
const onInteraction = async (interaction: Interaction) => {
  if (interaction.isAutocomplete())
    if (interaction.commandName === 'encounter') {
      const query = interaction.options.getFocused();

      const fuzzySearch = search(query, leadMonsters, searchOpts).map(
        result => result.target
      );
      await interaction.respond(
        fuzzySearch.map(choice => ({name: choice, value: choice}))
      );
    }

  // verify intertaction type here and run the approriate function
  if (interaction.isCommand())
    await commandHash[interaction.commandName](interaction);
};

export {onInteraction};
