import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import axios from 'axios';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
import {botConfig, config, towerConfig} from '../config';
import {currentWeek, logger, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, IMAGE_PATH} = config;
const {administrators} = botConfig;

const {maxHeight, minHeight, themes, towerSprites} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to submit')
  .setRequired(false)
  .setChoices(...themeOpts);

const floorOptions = new SlashCommandIntegerOption()
  .setName('floor')
  .setDescription('Floor Number to submit')
  .setRequired(false)
  .setMinValue(minHeight)
  .setMaxValue(maxHeight);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('submissions')
    .setDescription('Approve, deny or list floor submissions')

    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List submissions')
        .addStringOption(themeOptions)
        .addIntegerOption(floorOptions)
    )

    .addSubcommand(subcommand =>
      subcommand
        .setName('approve')
        .setDescription('Approve floor submission')
        .addStringOption(option =>
          option
            .setName('approve_id')
            .setDescription('Submission to accept')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('deny')
        .setDescription('Deny floor submission')
        .addStringOption(option =>
          option
            .setName('deny_id')
            .setDescription('Submission to deny')
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

    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string | undefined;
    const floor = interaction.options.get('floor')?.value as number | undefined;
    const approveId = interaction.options.get('approve_id')?.value as
      | string
      | undefined;
    const denyId = interaction.options.get('deny_id')?.value as
      | string
      | undefined;

    if (approveId) {
      // retrieve db entry for submission
      const submission = await prisma.floorSubmission.findUnique({
        where: {id: approveId},
      });
      // TODO: proper response for no submission found
      if (!submission) return;

      const {chest, floor, guardian, puzzle, stray, theme, week} = submission;

      // upsert to current tower theme
      // insert db entry for approved tower floors
      await prisma.floor.upsert({
        where: {
          theme_week_floor: {theme, week, floor},
        },
        // if floor entry doesn't exist for the week, create it
        create: {
          // create tower entry if it doesn't exist, otherwise add relation
          tower: {
            connectOrCreate: {
              create: {theme, week},
              where: {theme_week: {theme, week}},
            },
          },
          floor: floor,
          guardians: guardian ? [guardian] : undefined,
          strays: stray ? [stray] : undefined,
          puzzles: puzzle ? [puzzle] : undefined,
          chests: chest !== null ? chest : undefined,
        },
        // if floor entry exists, update it
        update: {
          // create tower entry if it doesn't exist, otherwise add relation
          tower: {
            connectOrCreate: {
              create: {theme, week},
              where: {theme_week: {theme, week}},
            },
          },
          floor: floor,
          guardians: {push: guardian ? guardian : []},
          strays: {push: stray ? stray : []},
          puzzles: {push: puzzle ? puzzle : []},
          chests: chest,
        },
      });

      // mark submission entry as resolved + approved
      await prisma.floorSubmission.update({
        where: {id: approveId},
        data: {approved: true, resolved: true},
      });

      const embedFields: {name: string; value: string; inline?: boolean}[] = [];
      if (guardian) embedFields.push({name: 'Floor Guardian', value: guardian});
      if (stray) embedFields.push({name: 'Stray Monster', value: stray});
      if (chest)
        embedFields.push({name: 'Chest Count', value: chest.toString()});
      if (puzzle) embedFields.push({name: 'Puzzle', value: puzzle});

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`${theme} F${floor} Updated`)
        .setFields(...embedFields)
        .setThumbnail(
          towerSprites[
            (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
          ]
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} approved submission for ${theme} F${floor}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
      return;
    } else if (denyId) {
      // retrieve db entry for submission
      const submission = await prisma.floorSubmission.findUnique({
        where: {id: approveId},
      });
      // TODO: proper response for no submission found
      if (!submission) return;

      const {chest, floor, guardian, puzzle, stray, theme} = submission;

      // mark submission entry as resolved + denied
      await prisma.floorSubmission.update({
        where: {id: denyId},
        data: {approved: false, resolved: true},
      });

      // populate embed fields as exists in db
      const embedFields: {name: string; value: string; inline?: boolean}[] = [];
      if (guardian) embedFields.push({name: 'Floor Guardian', value: guardian});
      if (stray) embedFields.push({name: 'Stray Monster', value: stray});
      if (chest)
        embedFields.push({name: 'Chest Count', value: chest.toString()});
      if (puzzle) embedFields.push({name: 'Puzzle', value: puzzle});

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`${theme} F${floor} Submission Denied`)
        .setFields(...embedFields)
        .setThumbnail(
          towerSprites[
            (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
          ]
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      // logging human-readable command information
      const {tag: user} = interaction.user;
      logger.info(`${user} denied submission for ${theme} F${floor}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else {
      const submissions = await prisma.floorSubmission.findMany({
        where: {week, theme, floor, resolved: false},
        take: 10,
      });

      const responseEmbeds = [];
      for (const submission of submissions) {
        const {id, user, theme, floor, chest, guardian, puzzle, stray} =
          submission;
        const userObj = (await (
          await client.users.fetch(user)
        ).toJSON()) as Record<string, unknown>;
        const submissionEmbed = new EmbedBuilder()
          .setAuthor({
            name: (userObj.tag as string) + ' | ' + `${theme} F${floor}`,
            iconURL: userObj.avatarURL as string,
          })
          .addFields({name: 'Submission UID', value: id})
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp();

        if (guardian || stray) {
          const {image_name} = (
            await axios.post('https://ornapi.cadelabs.ovh/api/v0.1/monsters', {
              name: guardian || stray,
            })
          ).data[0];
          const type = guardian ? 'Floor Guardian' : 'Stray Monster';
          submissionEmbed
            .setTitle(type)
            .setThumbnail(IMAGE_PATH + image_name)
            .setDescription(guardian || stray);
        } else if (puzzle || chest !== null) {
          const type = puzzle ? 'Tower Puzzle' : 'Chest Count';
          submissionEmbed
            .setTitle(type)
            .setDescription(puzzle || chest?.toString() || '');
        }

        responseEmbeds.push(submissionEmbed);
      }

      if (responseEmbeds.length === 0)
        responseEmbeds.push(
          new EmbedBuilder()
            .setAuthor({
              name: `${theme}`,
            })
            .addFields({name: 'No Floors Submitted', value: 'Try again later!'})
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp()
        );

      await interaction.editReply({embeds: responseEmbeds});
    }
  },
};

export default command;
