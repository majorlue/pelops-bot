import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
import {config, botConfig} from '../config';
import {prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {administrators} = botConfig;

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
    ),

  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: true});

    // return if user is not a bot administrator
    if (!administrators.includes(interaction.user.id)) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL() || '',
            })
            .setTitle(`Permission Denied`)
            .setDescription(
              'Only bot administrators may use this command, sorry!'
            )
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp(),
        ],
      });
      // exit, as anauthenticated
      return;
    }

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
          iconURL: userObj.avatarURL as string,
        })
        .setTitle(`Added Contributor`)
        .setDescription(
          'They will now be able to use `/submit` to directly modify public Tower information'
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

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
          iconURL: userObj.avatarURL as string,
        })
        .setTitle(`Removed Contributor`)
        .setDescription(
          'They will now be subject to the submissions process when using `/submit`.'
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      await interaction.editReply({embeds: [responseEmbed]});
    }
  },
};

export default command;
