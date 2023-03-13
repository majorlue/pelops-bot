import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {maxHeight, minHeight, themes, towerSprites} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to view')
  .setRequired(true)
  .setChoices(...themeOpts);

const floorOptions = new SlashCommandIntegerOption()
  .setName('floor')
  .setDescription('Floor Number to view')
  .setRequired(false)
  .setMinValue(minHeight)
  .setMaxValue(maxHeight);

const command: Command = {
  data: new SlashCommandBuilder()
    // slash command invoke
    .setName('tower')
    .setDescription("Retrieve current week's Tower information")
    .addStringOption(themeOptions)
    .addIntegerOption(floorOptions),
  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: true});

    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as
      | 'Selene'
      | 'Eos'
      | 'Oceanus'
      | 'Prometheus'
      | 'Themis';
    const floor = interaction.options.get('floor')?.value as number | undefined;

    const floors = await prisma.floor.findMany({where: {week, theme, floor}});

    const floorFields = [];
    for (const floor of floors) {
      const {floor: floorNum, guardians, strays, puzzles, chests} = floor;
      const field = {name: '', value: '', inline: false, floor: floor.floor};
      field.name = `Floor ${floorNum}`;

      if (guardians.length > 0)
        field.value = '**Guardians**: ' + guardians.join(', ') + '\n';
      if (strays.length > 0)
        field.value += '**Strays**: ' + strays.join(', ') + '\n';
      if (puzzles.length > 0)
        field.value += '**Puzzles**: ' + puzzles.join(', ') + '\n';
      if (chests !== null)
        field.value += '**Chests**: ' + chests.toString() + '\n';

      floorFields.push(field);
    }
    // sort by floor number
    floorFields.sort((a, b) => a.floor - b.floor);

    const responseEmbeds = [];

    if (floorFields.length < 25) {
      // build embed for the command
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `Week of ${week}`,
          })
          .setTitle(`${theme} Floors`)
          .addFields(floorFields)
          .setThumbnail(towerSprites[theme])
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp()
      );
    } else {
      // build embed for the command
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `Week of ${week}`,
          })
          .setTitle(`${theme} Floors`)
          .addFields(floorFields.filter(x => x.floor <= 20))
          .setThumbnail(towerSprites[theme])
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp()
      );
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `Week of ${week}`,
          })
          .setTitle(`${theme} Floors`)
          .addFields(floorFields.filter(x => x.floor > 20))
          .setThumbnail(towerSprites[theme])
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp()
      );
    }

    await interaction.editReply({embeds: responseEmbeds});
  },
};

export default command;
