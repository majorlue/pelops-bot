import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, CONTRIBUTION_REQUEST_MSG} = config;
const {themes} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('chests')
    .setDescription('Retrieve floors containing chests')
    .addStringOption(option =>
      option
        .setName('theme')
        .setDescription('Tower Theme to filter')
        .setRequired(false)
        .setChoices(...themeOpts)
    ),
  run: async interaction => {
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as
      | 'Selene'
      | 'Eos'
      | 'Oceanus'
      | 'Prometheus'
      | 'Themis';

    // db query for current week floors with non-zero chests, theme optional
    const chestFloors = await prisma.floor.findMany({
      where: {
        theme,
        week,
        chests: {gt: 0},
      },
    });

    if (chestFloors.length === 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${theme} | Week of ${week}`,
            })
            .setDescription(
              `No Tower info found for ${theme}, week ${week}. We're waiting on user contributions for the week.\n\n` +
                CONTRIBUTION_REQUEST_MSG
            )
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setFooter({text: FOOTER_MESSAGE})
            .setTimestamp(),
        ],
      });
      return;
    }

    // sort key floors in ascending order
    chestFloors.sort((a, b) => a.floor - b.floor);

    const keyFormat: Record<string, string> = {};
    // add theme to object as long as it has floors (empty if theme specified)
    for (const theme of themes)
      if (chestFloors.filter(x => x.theme === theme).length > 0)
        keyFormat[theme] = '\u200b';

    // add each floor's chest count on a newline, indent single digit floors so they're aligned
    for (const floor of chestFloors)
      keyFormat[floor.theme] +=
        (floor.floor >= 10 ? `\`F${floor.floor}\`` : `\` F${floor.floor}\``) +
        ': ' +
        `**${floor.chests}**x` +
        '\n';

    // create embed fields for each theme
    const fields = [];
    for (const theme in keyFormat)
      fields.push({name: theme, value: keyFormat[theme], inline: true});

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Week of ${week}`,
      })
      .setTitle(`Chest Floors`)
      .addFields(fields)
      .setThumbnail('https://orna.guide/static/orna/img/towers/chest.png')
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
