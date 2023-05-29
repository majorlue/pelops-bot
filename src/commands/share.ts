import {ColorResolvable, EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, CONTRIBUTION_REQUEST_MSG} = config;
const {themes} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('share')
    .setDescription('Output human-readable Tower data for easy sharing')
    .addStringOption(option =>
      option
        .setName('theme')
        .setDescription('Tower Theme to filter')
        .setRequired(true)
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
    const floors = await prisma.floor.findMany({where: {week, theme}});

    // sort key floors in ascending order
    floors.sort((a, b) => a.floor - b.floor);

    let displayText = '';
    if (floors.length === 0) {
      displayText =
        `No Tower info found for ${theme}, week ${week}. We're waiting on user contributions for the week.` +
        CONTRIBUTION_REQUEST_MSG;
    } else {
      for (const floor of floors) {
        const {floor: floorNum, guardians, strays, chests, puzzles} = floor;
        displayText += `F${floorNum}`;
        if (chests && chests > 0)
          displayText += ` (${chests} ${chests === 1 ? 'chest' : 'chests'})`;
        if (guardians.length > 0)
          displayText += ` | G: ` + guardians.join(', ');
        if (strays.length > 0) displayText += ` | S: ` + strays.join(', ');
        if (puzzles.length > 0) displayText += ` | P: ` + puzzles.join(', ');

        displayText += '\n';
      }

      displayText = '```' + displayText + '```';
    }

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${theme} | Week of ${week}`,
      })
      .setTitle(`Tower Layout Sharing`)
      .setDescription(displayText)
      .setThumbnail('https://orna.guide/static/orna/img/towers/chest.png')
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
