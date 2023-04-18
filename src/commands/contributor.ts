import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {client, dayjs, logger, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('contributor')
    .setDescription('Add or remove approved contributors')

    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a new contributor')
        .addUserOption(option =>
          option
            .setName('add_user')
            .setDescription('User to mark as a contributor')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a current contributor')
        .addUserOption(option =>
          option
            .setName('remove_user')
            .setDescription('User to remove as a contributor')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('list').setDescription('List all current contributors')
    ),

  run: async interaction => {
    const addUser = interaction.options.get('add_user')?.value as
      | string
      | undefined;
    const removeUser = interaction.options.get('remove_user')?.value as
      | string
      | undefined;

    // TODO: figure out better slash command handling than checking for defined vars
    if (addUser) {
      // add the target user as a contributor in db
      await prisma.contributor.upsert({
        where: {id: addUser},
        create: {id: addUser},
        update: {id: addUser},
      });
      // retrieve target user profile (for tag, avatar)
      const userObj = (await (
        await client.users.fetch(addUser)
      ).toJSON()) as Record<string, unknown>;

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: userObj.tag as string,
          iconURL: (userObj.avatarURL as string) || undefined,
        })
        .setTitle(`Added Contributor`)
        .setDescription(
          'They will now be able to use `/submit` to directly modify public Tower information'
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} added contributor: ${userObj.tag}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else if (removeUser) {
      // TODO: error handling for deleting user that isn't a contributor (record to delete DNE)
      // remove the target user as a contributor in db
      await prisma.contributor.delete({where: {id: removeUser}});
      // retrieve target user profile (for tag, avatar)
      const userObj = (await (
        await client.users.fetch(removeUser)
      ).toJSON()) as Record<string, unknown>;

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: userObj.tag as string,
          iconURL: (userObj.avatarURL as string) || undefined,
        })
        .setTitle(`Removed Contributor`)
        .setDescription(
          'They will now be subject to the submissions process when using `/submit`.'
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} removed contributor: ${userObj.tag}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else {
      const contributorIds = (await prisma.contributor.findMany()).sort(
        (a, b) => a.createdOn.valueOf() - b.createdOn.valueOf()
      );

      let description = '';
      for (const contributor of contributorIds) {
        const {id, createdOn} = contributor;
        const dateAdded = dayjs(createdOn).format('DD/MM/YYYY');
        const userObj = (await (
          await client.users.fetch(id)
        ).toJSON()) as Record<string, unknown>;

        description += `**${userObj.tag}**: ${dateAdded}\n`;
      }
      const responseEmbed = new EmbedBuilder()
        .setTitle(`Contributors (${contributorIds.length} total)`)
        .setDescription(description)
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      await interaction.editReply({embeds: [responseEmbed]});
    }
  },
};

export default command;
