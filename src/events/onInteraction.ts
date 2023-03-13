import {Interaction} from 'discord.js';
import {go as search} from 'fuzzysort';
import {commandHash} from '../commands';
import {logger} from '../handlers';
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
  if (interaction.isAutocomplete()) {
    const {commandName: command, options} = interaction;

    if (command === 'encounter' || 'submit') {
      // we do a little instrumentation
      const start = Date.now();
      const query = options.getFocused();

      const fuzzySearch = search(query, leadMonsters, searchOpts).map(
        result => result.target
      );
      await interaction.respond(
        fuzzySearch.map(choice => ({name: choice, value: choice}))
      );
      const time = `${Date.now() - start}ms`;
      logger.info(`Autocomplete for /${command} completed in ${time}`, {
        time,
        command,
        type: 'autocomplete',
        user: interaction.user.tag,
      });
      return;
    }
  }

  // verify intertaction type here and run the approriate function
  if (interaction.isCommand()) {
    // we do a little instrumentation
    const start = Date.now();
    const command = interaction.commandName;

    await commandHash[command](interaction);

    const time = `${Date.now() - start}ms`;
    logger.info(`Executed command /${command} in ${time}`, {
      time,
      command,
      type: 'command',
      user: interaction.user.tag,
    });
    return;
  }
};

export {onInteraction};
