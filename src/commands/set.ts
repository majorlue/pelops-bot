import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {
  currentWeek,
  leadMonsters,
  logger,
  monsterNotFoundEmbed,
  prisma,
} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {
  maxChests,
  maxHeight,
  minChests,
  minHeight,
  puzzles,
  themes,
  towerSprites,
} = towerConfig;
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
    .setName('set')
    .setDescription('Set Tower floor information')

    .addStringOption(themeOptions)
    .addIntegerOption(floorOptions)

    .addStringOption(option =>
      option
        .setName('guardian_one')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('guardian_two')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('guardian_three')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('guardian_four')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('stray_one')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('stray_two')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('stray_three')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('stray_four')
        .setDescription('Lead monster to search for')
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption(option =>
      option
        .setName('puzzle_one')
        .setDescription('Puzzle type on this floor')
        .setRequired(false)
        .addChoices(...puzzleOpts)
    )
    .addStringOption(option =>
      option
        .setName('puzzle_two')
        .setDescription('Puzzle type on this floor')
        .setRequired(false)
        .addChoices(...puzzleOpts)
    )
    .addStringOption(option =>
      option
        .setName('puzzle_three')
        .setDescription('Puzzle type on this floor')
        .setRequired(false)
        .addChoices(...puzzleOpts)
    )
    .addIntegerOption(option =>
      option
        .setName('chest_count')
        .setDescription('Number of chests on this floor')
        .setRequired(false)
        .setMinValue(minChests)
        .setMaxValue(maxChests)
    ),
  run: async interaction => {
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string;
    const floor = interaction.options.get('floor')?.value as number;
    if (!theme || !floor) throw new Error();

    const chests = interaction.options.get('chest_count')?.value as
      | number
      | undefined;

    const responseEmbed = new EmbedBuilder()

      .setTitle(`Set ${theme} F${floor}`)
      .setThumbnail(
        towerSprites[
          (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
        ]
      )
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();
    const embedFields: {name: string; value: string; inline?: boolean}[] = [];
    const guardians: string[] = [];
    const strays: string[] = [];
    const puzzles: string[] = [];

    for (const input of [
      'guardian_one',
      'guardian_two',
      'guardian_three',
      'guardian_four',
    ]) {
      const guardian = interaction.options.get(input)?.value as
        | string
        | undefined;

      // check whether user sent input
      if (guardian !== undefined)
        if (!(await leadMonsters).includes(guardian)) {
          await interaction.editReply(monsterNotFoundEmbed(interaction));
          return;
        } else guardians.push(guardian);
    }
    for (const input of [
      'stray_one',
      'stray_two',
      'stray_three',
      'stray_four',
    ]) {
      const stray = interaction.options.get(input)?.value as string | undefined;

      // check whether user sent input
      if (stray !== undefined)
        if (!(await leadMonsters).includes(stray)) {
          await interaction.editReply(monsterNotFoundEmbed(interaction));
          return;
        } else strays.push(stray);
    }
    for (const input of [
      'puzzle_one',
      'puzzle_two',
      'puzzle_three',
      'puzzle_four',
    ]) {
      const puzzle = interaction.options.get(input)?.value as
        | string
        | undefined;

      // check whether user sent input
      if (puzzle !== undefined) puzzles.push(puzzle);
    }

    const towerFloor = await prisma.floor.upsert({
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
        guardians: guardians.length > 0 ? guardians : undefined,
        strays: strays.length > 0 ? strays : undefined,
        puzzles: puzzles.length > 0 ? puzzles : undefined,
        chests: chests,
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
        guardians: guardians.length > 0 ? {set: guardians} : undefined,
        strays: strays.length > 0 ? {set: strays} : undefined,
        puzzles: puzzles.length > 0 ? {set: puzzles} : undefined,
        chests: chests,
      },
    });

    if (towerFloor.guardians.length > 0)
      embedFields.push({
        name: '**Guardians**',
        value: towerFloor.guardians.join(', '),
      });
    if (towerFloor.strays.length > 0)
      embedFields.push({
        name: '**Strays**',
        value: towerFloor.strays.join(', '),
      });
    if (towerFloor.puzzles.length > 0)
      embedFields.push({
        name: '**Puzzles**',
        value: towerFloor.puzzles.join(', '),
      });
    if (towerFloor.chests !== null)
      embedFields.push({
        name: '**Chests**',
        value: towerFloor.chests.toString(),
      });

    // logging human-readable command information
    const {tag: user} = interaction.user;
    logger.info(`${user} set floor: ${week} ${theme} F${floor}`, {
      command: command.data.name,
      type: 'info',
      user: user,
      submission: embedFields,
    });

    responseEmbed.setFields(...embedFields);
    await interaction.editReply({
      embeds: [responseEmbed],
    });
  },
};

export default command;
