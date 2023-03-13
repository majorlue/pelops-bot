import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
import {config, towerConfig} from '../config';
import {currentWeek, logger, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;

const {maxHeight, minHeight, themes, towerSprites} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to filter for')
  .setRequired(false)
  .setChoices(...themeOpts);

const floorOptions = new SlashCommandIntegerOption()
  .setName('floor')
  .setDescription('Floor Number to filter for')
  .setRequired(false)
  .setMinValue(minHeight)
  .setMaxValue(maxHeight);

const userOption = new SlashCommandUserOption()
  .setName('user')
  .setDescription('User to filter for')
  .setRequired(false);

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
        .addUserOption(userOption)
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
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string | undefined;
    const floor = interaction.options.get('floor')?.value as number | undefined;
    const submissionUser = interaction.options.get('user')?.value as
      | string
      | undefined;

    const approveId = interaction.options.get('approve_id')?.value as
      | string
      | undefined;
    const denyId = interaction.options.get('deny_id')?.value as
      | string
      | undefined;

    if (approveId) {
      // retrieve db entry for submission
      const submission = await prisma.floorSubmission.findUniqueOrThrow({
        where: {id: approveId},
      });
      // TODO: proper response for no submission found

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
      logger.info(`${user} approved submission: ${approveId}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
      return;
    } else if (denyId) {
      // retrieve db entry for submission
      const submission = await prisma.floorSubmission.findUniqueOrThrow({
        where: {id: denyId},
      });
      // TODO: proper response for no submission found

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
      logger.info(`${user} denied submission: ${denyId}`, {
        command: command.data.name,
        type: 'info',
        user: user,
      });

      await interaction.editReply({embeds: [responseEmbed]});
    } else {
      const submissions = await prisma.floorSubmission.findMany({
        where: {week, theme, floor, resolved: false, user: submissionUser},
      });
      submissions.sort((a, b) => a.floor - b.floor);
      submissions.sort((a, b) => (a.theme > b.theme ? -1 : 1));

      let desc = '';
      const themeFloors: Record<string, number[]> = {};
      for (const submission of submissions) {
        const {id, user, theme, floor, chest, guardian, puzzle, stray} =
          submission;

        const userObj = (await (
          await client.users.fetch(user)
        ).toJSON()) as Record<string, unknown>;

        if (!themeFloors[theme]) themeFloors[theme] = [];
        themeFloors[theme].push(floor);
        desc += `**${theme}** **F${floor}**\n`;
        if (guardian) desc += '`Floor Guardian`: ' + guardian + '\n';
        if (stray) desc += '`Stray Monster`: ' + guardian + '\n';
        if (puzzle) desc += '`Tower Puzzle`: ' + guardian + '\n';
        if (chest) desc += '`Chest Count`: ' + guardian + '\n';

        desc += `\`Submitted by\`: ${userObj.tag}` + '\n';
        desc += `\`Submission ID\`: ${id}\n\n`;
      }

      // discord has an embed description limit of 4000
      if (desc.length > 4000) {
        desc =
          'There are too many submissions! Try specifying `theme` and/or `floor`\n\n';
        for (const theme of themes) {
          const count = submissions.filter(x => x.theme === theme).length;
          desc += `**${theme}** has ${count} submissions:\n`;
          desc += themeFloors[theme].join(', ') + '\n\n';
        }
      }

      const responseEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Week of ${week} | ${submissions.length} submissions`,
        })
        .setTitle('Floor Submissions')
        .setDescription(desc || 'No submissions found!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      await interaction.editReply({embeds: [responseEmbed]});
    }
  },
};

export default command;
