import {ChannelType, Interaction} from 'discord.js';
import {go as search} from 'fuzzysort';
import {
  adminCmds,
  commandHash,
  contribCmds,
  ephemeralCmds,
  modalCmds,
  modalHash,
  monsterAutoCmds,
  ownerCmds,
} from '../commands';
import {config} from '../config';
import {
  adminCommandEmbed,
  checkPerms,
  client,
  commandErrorEmbed,
  contribCommandEmbed,
  devErrorEmbed,
  leadMonsters,
  logger,
  ownerCommandEmbed,
} from '../handlers';

const {ERROR_CHANNEL} = config;

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
    // only provide monster automcomplete for monster fields
    if (monsterAutoCmds.includes(interaction.commandName)) {
      await interaction.respond(
        search(interaction.options.getFocused(), await leadMonsters, searchOpts)
          .map(result => result.target)
          .map(choice => ({name: choice, value: choice}))
      );
    }
    // other automcomplete fields go here
  } else if (interaction.isModalSubmit()) {
    try {
      // we do a little instrumentation
      const start = Date.now();
      const {customId: modalId} = interaction;

      await interaction.deferReply({
        ephemeral: true,
      });

      await modalHash[modalId](interaction);

      const time = `${Date.now() - start}ms`;
      logger.info(`Handled modal ${modalId} in ${time}`, {
        time,
        modalId,
        type: 'modal',
        user: interaction.user.tag,
      });
      return;
    } catch (err) {
      // typecasting for safety. we know it's a type of error
      const error = err as Error;
      // TODO: handle other error types explicitly. main ones are prisma and discordjs

      // edit interaction response to notify players error happened and log error
      await interaction.editReply(commandErrorEmbed(interaction));

      // log error with level 'error' and include additional context in log obj
      logger.error(error.message, {
        modal: interaction.customId,
        args: interaction.fields.components,
        user: interaction.user.tag,
        guild: interaction.guildId,
        ...error,
      });
    }
  }

  // verify intertaction type here and run the approriate function
  else if (interaction.isCommand()) {
    // wrap ALL commands for error handling -- gives user feedback if there's an issue
    try {
      // we do a little instrumentation
      const start = Date.now();
      const {commandName: command, user} = interaction;

      // Discord requires acknowledgement within 3 seconds, so just defer reply for non-modal cmds
      // Modals require a response with the modal itself, then a (potentially deferred) response to modal submission
      if (!modalCmds.includes(command))
        await interaction.deferReply({
          ephemeral: ephemeralCmds.includes(command),
        });

      // check if user has required permissions for elevated commands
      if (ownerCmds.includes(command) && !(await checkPerms(user.id)).owner) {
        await interaction.editReply(ownerCommandEmbed(interaction));
        return;
      }
      if (adminCmds.includes(command) && !(await checkPerms(user.id)).admin) {
        await interaction.editReply(adminCommandEmbed(interaction));
        return;
      }
      if (
        contribCmds.includes(command) &&
        !(await checkPerms(user.id)).contrib
      ) {
        await interaction.editReply(contribCommandEmbed(interaction));
        return;
      } else await commandHash[command](interaction);

      const time = `${Date.now() - start}ms`;
      logger.info(`Executed command /${command} in ${time}`, {
        time,
        command,
        type: 'command',
        user: interaction.user.tag,
      });
      return;
    } catch (err) {
      // typecasting for safety. we know it's a type of error
      const error = err as Error;
      // TODO: handle other error types explicitly. main ones are prisma and discordjs

      // edit interaction response to notify players error happened and log error
      if (interaction.replied)
        await interaction.editReply(commandErrorEmbed(interaction));
      else await interaction.reply(commandErrorEmbed(interaction));

      // log error with level 'error' and include additional context in log obj
      logger.error(error.message, {
        command: interaction.commandName,
        args: interaction.options.data,
        user: interaction.user.tag,
        guild: interaction.guildId,
        ...error,
      });
    }
  }
};

export {onInteraction};
