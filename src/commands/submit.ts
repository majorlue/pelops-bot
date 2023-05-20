import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {
  checkPerms,
  currentWeek,
  leadMonsters,
  logger,
  monsterNotFoundEmbed,
  numberToWords,
  prisma,
} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const SUBMIT_THRESHOLD = Number(config.SUBMIT_THRESHOLD);

const {
  maxGuardians,
  maxStrays,
  maxPuzzles,
  maxChests,
  maxHeight,
  minHeight,
  puzzles,
  themes,
  towerSprites,
} = towerConfig;
const puzzleTypes = Object.keys(puzzles).map(x => ({name: x, value: x}));
const themeOpts = themes.map(x => ({name: x, value: x}));
const guardianOpts = [...Array(maxGuardians).keys()].map(
  i => `guardian_${numberToWords(i + 1).replace(' ', '_')}`
);
const strayOpts = [...Array(maxStrays).keys()].map(
  i => `stray_${numberToWords(i + 1).replace(' ', '_')}`
);
const puzzleOpts = [...Array(maxPuzzles).keys()].map(
  i => `puzzle_${numberToWords(i + 1).replace(' ', '_')}`
);

const commandOpts = new SlashCommandBuilder()
  .setName('submit')
  .setDescription('Submit complete Tower floor information')

  .addStringOption(option =>
    option
      .setName('theme')
      .setDescription('Tower Theme to submit')
      .setRequired(true)
      .setChoices(...themeOpts)
  )
  .addIntegerOption(option =>
    option
      .setName('floor')
      .setDescription('Floor Number to submit')
      .setRequired(true)
      .setMinValue(minHeight)
      .setMaxValue(maxHeight)
  )

  .addIntegerOption(option =>
    option
      .setName('chest_count')
      .setDescription('Total chests')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(maxChests)
  );

for (const input of guardianOpts)
  commandOpts.addStringOption(option =>
    option
      .setName(input)
      .setDescription('Guardian encounter sprite')
      .setRequired(false)
      .setAutocomplete(true)
  );

for (const input of strayOpts)
  commandOpts.addStringOption(option =>
    option
      .setName(input)
      .setDescription('Stray encounter sprite')
      .setRequired(false)
      .setAutocomplete(true)
  );

for (const input of puzzleOpts)
  commandOpts.addStringOption(option =>
    option
      .setName(input)
      .setDescription('Floor puzzle type')
      .setRequired(false)
      .setChoices(...puzzleTypes)
  );

const command: Command = {
  data: commandOpts,
  run: async interaction => {
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string;
    const floor = interaction.options.get('floor')?.value as number;
    const chests = interaction.options.get('chest_count')?.value as number;

    const embedFields: {name: string; value: string; inline?: boolean}[] = [];

    const guardians: string[] = [];
    for (const input of guardianOpts) {
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

    const strays: string[] = [];
    for (const input of strayOpts) {
      const stray = interaction.options.get(input)?.value as string | undefined;

      // check whether user sent input
      if (stray !== undefined)
        if (!(await leadMonsters).includes(stray)) {
          await interaction.editReply(monsterNotFoundEmbed(interaction));
          return;
        } else strays.push(stray);
    }
    const puzzles: string[] = [];
    for (const input of puzzleOpts) {
      const puzzle = interaction.options.get(input)?.value as
        | string
        | undefined;

      // check whether user sent input
      if (puzzle !== undefined) puzzles.push(puzzle);
    }
    const isContributor = (await checkPerms(interaction.user.id)).contrib;

    // check if current floor info is identical to submission
    const currFloor = await prisma.floor.findFirst({
      where: {
        tower: {theme, week},
        floor,
        guardians: {hasEvery: guardians},
        strays: {hasEvery: strays},
        puzzles: {hasEvery: puzzles},
        chests: {equals: chests},
      },
    });

    // if it's identical, respond with duplicate and exit function
    if (currFloor) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Tower Floor Submission`,
              iconURL: interaction.user.avatarURL() || undefined,
            })
            .setTitle(`${theme} F${floor}: Not Submitted`)
            .setDescription(
              `This is identical to the current floor information, so no need to resubmit. Thanks for contributing anyways, though! <3`
            )
            .setFields(...embedFields)
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
      return;
    }

    // if it's not identical, then create a submission and handle accordingly
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
        guardians,
        strays,
        chests,
        puzzles,
        // if contributor then approve/resolve submission
        resolved: isContributor,
        approved: isContributor ? isContributor : undefined,
      },
    });

    if (submission.guardians.length > 0)
      embedFields.push({
        name: '**Guardians**',
        value: submission.guardians.join(', '),
      });
    if (submission.strays.length > 0)
      embedFields.push({
        name: '**Strays**',
        value: submission.strays.join(', '),
      });
    if (submission.puzzles.length > 0)
      embedFields.push({
        name: '**Puzzles**',
        value: submission.puzzles.join(', '),
      });
    if (submission.chests !== null)
      embedFields.push({
        name: '**Chests**',
        value: submission.chests.toString(),
      });

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

    if (isContributor) {
      // if contributor, then update that floor
      await prisma.floor.upsert({
        where: {theme_week_floor: {theme, week, floor}},
        update: {
          guardians: {set: guardians},
          strays: {set: strays},
          puzzles: {set: puzzles},
          chests: chests,
        },
        create: {
          tower: {
            connectOrCreate: {
              create: {theme, week},
              where: {theme_week: {theme, week}},
            },
          },
          floor: floor,
          guardians: guardians,
          strays: strays,
          puzzles: puzzles,
          chests: chests,
        },
      });
      // mark all identical, unresolved submissions as approved
      await prisma.floorSubmission.updateMany({
        where: {
          tower: {theme, week},
          guardians: {hasEvery: submission.guardians},
          strays: {hasEvery: submission.strays},
          puzzles: {hasEvery: submission.puzzles},
          chests: {equals: submission.chests},
          user: {not: user},
          resolved: {not: false},
        },
        data: {
          approved: true,
          resolved: true,
        },
      });
      // mark remaining unresolved sumissions as denied
      await prisma.floorSubmission.updateMany({
        where: {
          tower: {theme, week},
          resolved: {not: false},
        },
        data: {
          approved: false,
          resolved: true,
        },
      });
      // response message if they're a contributor
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `Tower Floor Submission`,
              iconURL: interaction.user.avatarURL() || undefined,
            })
            .setTitle(`${theme} F${floor}: Updated!`)
            .setDescription(
              `Submission approved as you are an approved contributor. Thanks for helping out <3`
            )
            .setFields(...embedFields)
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
    } else {
      // if not a cotnributor, retrieve identical submissions
      const sameSubmissions = await prisma.floorSubmission.findMany({
        where: {
          tower: {theme, week},
          guardians: {hasEvery: submission.guardians},
          strays: {hasEvery: submission.strays},
          puzzles: {hasEvery: submission.puzzles},
          chests: {equals: submission.chests},
          user: {not: user},
        },
      });
      // if there's enough submissions, mark them all as approved and update floor
      if (sameSubmissions.length > SUBMIT_THRESHOLD) {
        await prisma.floor.upsert({
          where: {theme_week_floor: {theme, week, floor}},
          update: {
            guardians: {set: guardians},
            strays: {set: strays},
            puzzles: {set: puzzles},
            chests: chests,
          },
          create: {
            tower: {
              connectOrCreate: {
                create: {theme, week},
                where: {theme_week: {theme, week}},
              },
            },
            floor: floor,
            guardians: guardians,
            strays: strays,
            puzzles: puzzles,
            chests: chests,
          },
        });
        // mark all existing identical submissions as approved
        await prisma.floorSubmission.updateMany({
          where: {
            tower: {theme, week},
            guardians: {hasEvery: submission.guardians},
            strays: {hasEvery: submission.strays},
            puzzles: {hasEvery: submission.puzzles},
            chests: {equals: submission.chests},
            resolved: {not: false},
          },
          data: {
            approved: true,
            resolved: true,
          },
        });
        // mark remaining unresolved sumissions as denied
        await prisma.floorSubmission.updateMany({
          where: {
            tower: {theme, week},
            resolved: {not: false},
          },
          data: {
            approved: false,
            resolved: true,
          },
        });
        // log the autoupdate
        logger.info(
          `Submission threshold met, auto-updated: ${week} ${theme} F${floor}`,
          {
            command: command.data.name,
            type: 'info',
          }
        );

        // response message if enough identical contributions
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Tower Floor Submission`,
                iconURL: interaction.user.avatarURL() || undefined,
              })
              .setTitle(`${theme} F${floor}: Updated!`)
              .setDescription(
                `Submission approved as there are ${SUBMIT_THRESHOLD} identical submissions. Thanks for contributing <3`
              )
              .setFields(...embedFields)
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
      } else {
        // response message if they're not a contributor, notify of threshold
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setAuthor({
                name: `Tower Floor Submission`,
                iconURL: interaction.user.avatarURL() || undefined,
              })
              .setTitle(`${theme} F${floor}: Pending Approval`)
              .setDescription(
                `If ${SUBMIT_THRESHOLD} identical submissions are received, they will all be automatically approved. Thanks for contributing <3`
              )
              .setFields(...embedFields)
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
    }
  },
};

export default command;
