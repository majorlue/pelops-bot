import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {client, currentWeek, prisma} from '../handlers';
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
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as
      | 'Selene'
      | 'Eos'
      | 'Oceanus'
      | 'Prometheus'
      | 'Themis';
    const floor = interaction.options.get('floor')?.value as number | undefined;

    const floors = await prisma.floor.findMany({where: {week, theme, floor}});
    floors.sort((a, b) => a.floor - b.floor);

    const chestEmoji = client.emojis.cache.find(
      emoji => emoji.name === 'tower_chest'
    );

    const floorText: string[] = [];
    let embedNum = 0;
    let prevFloor: number = 1;
    for (const floor of floors) {
      const {floor: floorNum, guardians, strays, puzzles, chests} = floor;

      let text =
        `**Floor ${floorNum}**` +
        (chests ? ` (${chests}x ${chestEmoji})` : '') +
        '\n';
      if (guardians.length > 0)
        text += '`Guardians`: ' + guardians.join(', ') + '\n';
      if (strays.length > 0) text += '`Strays`: ' + strays.join(', ') + '\n';
      if (puzzles.length > 0) text += '`Puzzles`: ' + puzzles.join(', ') + '\n';

      // if the length is going to exceed discord's limit, create another embed
      if (!floorText[embedNum]) floorText[embedNum] = '\u200b';
      else if (floorText[embedNum].length + text.length > 4096) embedNum++;

      floorText[embedNum] += text + '\n';
      prevFloor = floorNum;
    }

    const responseEmbeds = [];
    for (const embedText of floorText)
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `${theme} | Week of ${week}`,
          })
          .setDescription(embedText.replace('undefined', ''))
          .setThumbnail(towerSprites[theme])
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setFooter({text: FOOTER_MESSAGE})
          .setTimestamp()
      );

    await interaction.editReply({embeds: responseEmbeds});
  },
};

export default command;
