import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import axios from 'axios';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {
  approveSubmission,
  currentWeek,
  leadMonsters,
  logger,
  monsterNotFoundEmbed,
  prisma,
} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, IMAGE_PATH} = config;
const {maxChests, maxHeight, minChests, minHeight, puzzles, themes} =
  towerConfig;
const puzzleOpts = Object.keys(puzzles).map(x => ({name: x, value: x}));
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to submit')
  .setRequired(true)
  .setChoices(...themeOpts);

const floorOptions = new SlashCommandIntegerOption()
  .setName('floor')
  .setDescription('Floor Number to submit')
  .setRequired(true)
  .setMinValue(minHeight)
  .setMaxValue(maxHeight);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('submit')
    .setDescription('Submit Tower information')

    .addSubcommand(subcommand =>
      subcommand
        .setName('guardian')
        .setDescription('Submit Floor Guardian information')
        .addStringOption(themeOptions)
        .addIntegerOption(floorOptions)
        .addStringOption(option =>
          option
            .setName('guardian')
            .setDescription('Lead monster to search for')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stray')
        .setDescription('Submit Stray Monster information')
        .addStringOption(themeOptions)
        .addIntegerOption(floorOptions)
        .addStringOption(option =>
          option
            .setName('stray')
            .setDescription('Lead monster to search for')
            .setRequired(true)
            .setAutocomplete(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('chest')
        .setDescription('Submit chest count information')
        .addStringOption(themeOptions)
        .addIntegerOption(floorOptions)
        .addIntegerOption(option =>
          option
            .setName('chest')
            .setDescription('Number of chests on this floor')
            .setRequired(true)
            .setMinValue(minChests)
            .setMaxValue(maxChests)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('puzzle')
        .setDescription('Submit puzzle type information')
        .addStringOption(themeOptions)
        .addIntegerOption(floorOptions)
        .addStringOption(option =>
          option
            .setName('puzzle')
            .setDescription('Puzzle type on this floor')
            .setRequired(true)
            .addChoices(...puzzleOpts)
        )
    ),
  run: async interaction => {
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string;
    const floor = interaction.options.get('floor')?.value as number;
    if (!theme || !floor) throw new Error();

    const guardian = interaction.options.get('guardian')?.value as
      | string
      | undefined;
    const stray = interaction.options.get('stray')?.value as string | undefined;
    const chest = interaction.options.get('chest')?.value as number | undefined;
    const puzzle = interaction.options.get('puzzle')?.value as
      | string
      | undefined;

    const embedFields: {name: string; value: string; inline?: boolean}[] = [];

    embedFields.push({name: 'Tower Theme', value: theme, inline: true});
    embedFields.push({name: `Floor`, value: floor.toString(), inline: true});

    // check whether monster input matches a provided autocomplete option
    if (guardian)
      if (!(await leadMonsters).includes(guardian)) {
        await interaction.editReply(monsterNotFoundEmbed(interaction));
        return;
      } else embedFields.push({name: 'Floor Guardian', value: guardian});
    if (stray)
      if (!(await leadMonsters).includes(stray)) {
        await interaction.editReply(monsterNotFoundEmbed(interaction));
        return;
      } else embedFields.push({name: 'Stray Monster', value: stray});

    if (chest) embedFields.push({name: 'Chest Count', value: chest.toString()});
    if (puzzle) embedFields.push({name: 'Puzzle', value: puzzle});

    // upsert to current tower theme
    const submission = await prisma.floorSubmission.create({
      data: {
        // create tower entry if it doesn't exist, otherwise add relation
        tower: {
          connectOrCreate: {
            create: {theme, week},
            where: {theme_week: {theme, week}},
          },
        },
        floor,
        user: interaction.user.id,
        guardian: guardian,
        stray: stray,
        chest: chest,
        puzzle: puzzle,
      },
    });

    // pull approved contributors
    const contributors = await prisma.contributor.findMany();
    const isContributor =
      contributors.filter(x => x.id === interaction.user.id).length > 0;

    const responseEmbed = [];
    // if they're an approved contributor, then skip the submission process and return the update embed
    if (isContributor) {
      const embed = await approveSubmission(submission);
      embed.setAuthor({
        name: `Tower Floor Submission`,
        iconURL: interaction.user.avatarURL() || '',
      });

      responseEmbed.push(embed);
    }
    // if they're a regular user, then go through full submission process
    else {
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Tower Floor Submission`,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Pending review`)
        .addFields(...embedFields)
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      if (guardian || stray) {
        const {image_name} = (
          await axios.post('https://ornapi.cadelabs.ovh/api/v0.1/monsters', {
            name: guardian || stray,
          })
        ).data[0];

        embed.setThumbnail(IMAGE_PATH + image_name);
      }

      responseEmbed.push(embed);
    }

    // logging human-readable command information
    const {tag: user} = interaction.user;
    logger.info(
      (isContributor ? '(Contributor) ' : '') +
        `${user} added submission: ${week} ${theme} F${floor}`,
      {
        command: command.data.name,
        type: 'info',
        user: user,
        submission: embedFields,
      }
    );

    await interaction.editReply({embeds: responseEmbed});
  },
};

export default command;
