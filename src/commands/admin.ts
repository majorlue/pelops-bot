import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
import {config} from '../config';
import {logger, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Add, remove or list admins')

    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a new admin')
        .addUserOption(option =>
          option
            .setName('add_user')
            .setDescription('User to mark as an admin')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a current admin')
        .addUserOption(option =>
          option
            .setName('remove_user')
            .setDescription('User to remove as an admin')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('list').setDescription('List all current admins')
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
      // add the target user as an admin in db
      await prisma.admin.upsert({
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
          iconURL: userObj.avatarURL as string,
        })
        .setTitle(`Added Admin`)
        .setDescription("They'll now be able to perform admin actions!")
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} added admin: ${userObj.tag}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else if (removeUser) {
      // TODO: error handling for deleting user that isn't an admin (record to delete DNE)
      // remove the target user as an admin in db
      await prisma.admin.delete({where: {id: removeUser}});
      // retrieve target user profile (for tag, avatar)
      const userObj = (await (
        await client.users.fetch(removeUser)
      ).toJSON()) as Record<string, unknown>;

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: userObj.tag as string,
          iconURL: userObj.avatarURL as string,
        })
        .setTitle(`Removed Contributor`)
        .setDescription('They can no longer perform admin actions!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} removed admin: ${userObj.tag}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else {
      // display with newest admin first
      const adminIds = (await prisma.admin.findMany()).sort(
        (a, b) => a.createdOn.valueOf() - b.createdOn.valueOf()
      );

      const responseEmbeds = [];
      for (const admin of adminIds) {
        const {id, createdOn} = admin;
        const userObj = (await (
          await client.users.fetch(id)
        ).toJSON()) as Record<string, unknown>;

        responseEmbeds.push(
          new EmbedBuilder()
            .setAuthor({
              name: userObj.tag as string,
              iconURL: userObj.avatarURL as string,
            })
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp(createdOn)
        );
      }
      // only display 10 newest admins, as discord supports 10 embeds per msg
      await interaction.editReply({embeds: responseEmbeds.slice(0, 10)});
    }
  },
};

export default command;
