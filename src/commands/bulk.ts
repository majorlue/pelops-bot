import {
  ActionRowBuilder,
  ColorResolvable,
  EmbedBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import {config, towerConfig} from '../config';
import {checkPerms, currentWeek, leadMonsters, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, SUBMIT_THRESHOLD} = config;

const {themes, puzzles, towerSprites} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));
const puzzleTypes = Object.keys(puzzles);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('bulk')
    .setDescription('Mass submission')
    .addSubcommand(option =>
      option
        .setName('submit')
        .setDescription('Submit information for multiple Tower floors')
        .addStringOption(option =>
          option
            .setName('theme')
            .setDescription('Tower Theme to filter')
            .setRequired(true)
            .setChoices(...themeOpts)
        )
    )
    .addSubcommand(option =>
      option
        .setName('help')
        .setDescription('View mass submission formatting and examples')
    ),
  run: async interaction => {
    if (interaction.options.data[0].name === 'help') {
      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Tower Floor Submission`,
              iconURL: interaction.user.avatarURL() || undefined,
            })
            .setTitle(`Bulk Submit Usage`)
            .setDescription(
              `This command requires a very specific format, explained below.\n\n` +
                `<FLOORNUMBER>:<GUARDIAN>,<GUARDIAN>|<STRAY>,<STRAY>|<CHEST_COUNT>|<PUZZLE>,<PUZZLE>\n\n` +
                `- Each floor must be on its own line, and must begin with the floor number followed by a colon.\n` +
                `- There are then 4 categories separated by pipes (\`|\`) in the following order: guardians, strays, chest count and puzzles.\n` +
                `- Guardians, strays and puzzles are separated within their categories by a comma (\`,\`). It s *not* a comma and space -- just a comma.\n` +
                `- Guardians, strays and puzzles don't have to be be written in full. Partial is okay as long as it matches to only one encounter/puzzle.\n` +
                `- Inputs that match 0 or multiple encounters/puzzles will fail.\n`
            )
            .addFields({
              name: 'Example',
              value:
                '```1:Odin,Frost Troll||2|lock\n' +
                '2:Arisen Demeter|Tower Guard,Anubis|0|\n' +
                '3:||1|\n```',
            })
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp(),
        ],
      });
      return;
    }

    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as
      | 'Selene'
      | 'Eos'
      | 'Oceanus'
      | 'Prometheus'
      | 'Themis';

    const floorsInput =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId(theme)
          .setLabel(`${theme}: Week of ${week}`)
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(1)
          .setMaxLength(4000)
          .setPlaceholder(
            '1:ODIN,FROST TROLL||2|lock\n' +
              '2:ARISEN DEMETER|TOWER GUARD,ANUBIS|0|\n' +
              '3:||1|\n'
          )
          .setRequired(true)
      );

    const modal = new ModalBuilder()
      .setCustomId('bulk')
      .setTitle('Bulk Submit')
      .addComponents(floorsInput);

    await interaction.showModal(modal);
  },
};

export async function bulkModal(interaction: ModalSubmitInteraction) {
  const theme = interaction.fields.fields.firstKey() as
    | 'Selene'
    | 'Eos'
    | 'Oceanus'
    | 'Prometheus'
    | 'Themis';
  const rawUserInput = interaction.fields.getTextInputValue(theme);

  const week = currentWeek();
  const isContributor = (await checkPerms(interaction.user.id)).contrib;

  const towerFloors = rawUserInput.split('\n').map(x => {
    const firstSplit = x.split(':'); // index 0 = floor number, index 1 = floor contents
    const floorContents = firstSplit[1].split('|'); // index 0 = guardians, index 1 = strays, index 2 = chest count, index 3 = puzzles

    return {
      floor: Number(firstSplit[0]),
      guardians: floorContents[0] ? floorContents[0].split(',') : [],
      strays: floorContents[1] ? floorContents[1].split(',') : [],
      chests: Number(floorContents[2]),
      puzzles: floorContents[3] ? floorContents[3].split(',') : [],
    };
  });

  const prismaTransactions = [];
  for (const currFloor of towerFloors) {
    const {floor, guardians, strays, chests, puzzles} = currFloor;
    const parsedFloor: {
      floor: number;
      guardians: string[];
      strays: string[];
      chests: number;
      puzzles: string[];
    } = {
      floor: floor,
      guardians: [],
      strays: [],
      chests: chests,
      puzzles: [],
    };

    for (const guardian of guardians) {
      const results = (await leadMonsters).filter(x => x.includes(guardian));
      if (results.length === 0) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing one of F${floor}'s guardians. Input '${guardian}' could not be found.`
            ),
          ],
        });
        return;
      } else if (results.length > 1) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing F${floor}'s guardians. Input '${guardian}' matches multiple encounters.`
            ),
          ],
        });

        return;
      } else parsedFloor.guardians.push(results[0]);
    }
    for (const stray of strays) {
      const results = (await leadMonsters).filter(x => x.includes(stray));
      if (results.length === 0) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing one of F${floor}'s strays. Input '${stray}' could not be found.`
            ),
          ],
        });

        return;
      } else if (results.length > 1) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing F${floor}'s strays. Input '${stray}' matches multiple encounters.`
            ),
          ],
        });

        return;
      } else parsedFloor.strays.push(results[0]);
    }
    for (const puzzle of puzzles) {
      const results = puzzleTypes.filter(x => x.includes(puzzle));
      if (results.length === 0) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing F${floor}'s puzzles. Input '${puzzle}' could not be found.`
            ),
          ],
        });
        return;
      } else if (results.length > 1) {
        await interaction.editReply({
          embeds: [
            invalidInputEmbed(interaction, theme).setDescription(
              `There was an error parsing F${floor}'s puzzles. Input '${puzzle}' matches multiple puzzles.`
            ),
          ],
        });
        return;
      } else parsedFloor.puzzles.push(results[0]);
    }

    if (isContributor) {
      prisma.floor.upsert({
        where: {theme_week_floor: {theme, week, floor}},
        update: parsedFloor,
        create: {
          tower: {
            connectOrCreate: {
              create: {theme, week},
              where: {theme_week: {theme, week}},
            },
          },
          ...parsedFloor,
        },
      });

      prismaTransactions.push(
        prisma.floorSubmission.updateMany({
          where: {
            tower: {theme, week},
            resolved: {not: false},
          },
          data: {
            approved: false,
            resolved: true,
          },
        })
      );
    } else {
      prisma.floorSubmission.create({
        data: {
          tower: {
            connectOrCreate: {
              create: {theme, week},
              where: {theme_week: {theme, week}},
            },
          },
          user: interaction.user.id,
          ...parsedFloor,
        },
      });
    }
  }

  await prisma.$transaction(prismaTransactions);

  await interaction.editReply({
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `Tower Floor Submission`,
          iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(
          `${theme} Week of ${week}: ${prismaTransactions.length} submissions`
        )
        .setDescription(
          isContributor
            ? `Submission approved as you are an approved contributor. Thanks for helping out <3`
            : `If ${SUBMIT_THRESHOLD} identical submissions are received, they will all be automatically approved. Thanks for contributing <3`
        )
        .addFields({name: 'Submission', value: '```' + rawUserInput + '```'})
        .setThumbnail(
          towerSprites[
            (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
          ]
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  });
}

function invalidInputEmbed(interaction: ModalSubmitInteraction, theme: string) {
  return new EmbedBuilder()
    .setAuthor({
      name: `Tower Floor Submission`,
      iconURL: interaction.user.avatarURL() || undefined,
    })
    .setTitle(`${theme} Not Submitted`)
    .setThumbnail(
      towerSprites[
        (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
      ]
    )
    .setFooter({text: FOOTER_MESSAGE})
    .setColor(EMBED_COLOUR as ColorResolvable)
    .setTimestamp();
}

export default command;
