import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
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

    const floorText: {startFloor: number; endFloor: number; text: string}[] =
      [];
    let embedNum = 0;

    const chestEmoji = client.emojis.cache.find(
      emoji => emoji.name === 'tower_chest'
    );

    // TODO: refactor length validation. this is a mess, ty
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
      if (
        floorText[embedNum] &&
        floorText[embedNum].text.length + text.length > 4096
      ) {
        floorText[embedNum].endFloor = prevFloor;
        embedNum++;
      }

      if (!floorText[embedNum])
        floorText.push({
          startFloor: floorNum,
          text: '',
          endFloor: floorNum,
        });

      floorText[embedNum].text += text + '\n';
      floorText[embedNum].endFloor = prevFloor;
      prevFloor = floorNum;
    }

    const responseEmbeds = [];
    for (const embedText of floorText)
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `Week of ${week}`,
          })
          .setTitle(
            `${theme} Floors ${embedText.startFloor} - ${embedText.endFloor}`
          )
          .setDescription(embedText.text)
          .setThumbnail(towerSprites[theme])
          .setColor(EMBED_COLOUR as ColorResolvable)
      );

    responseEmbeds[responseEmbeds.length - 1]
      .setFooter({text: FOOTER_MESSAGE})
      .setTimestamp();

    await interaction.editReply({embeds: responseEmbeds});
  },
};

export default command;
