import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {themes, keyFights} = towerConfig;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('keys')
    .setDescription('Retrieve floors containing key encounters'),
  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: true});

    const week = currentWeek();
    const keyFormat: Record<string, string> = {};
    for (const theme of themes) keyFormat[theme] = '\u200b';

    // db query for current week floors with key fights as either guardian or stray
    const keyFloors = await prisma.floor.findMany({
      where: {
        week: week,
        OR: [{guardians: {hasSome: keyFights}}, {strays: {hasSome: keyFights}}],
      },
    });

    // sort key floors in ascending order
    keyFloors.sort((a, b) => a.floor - b.floor);

    for (const floor of keyFloors) {
      const guardianCount = floor.guardians.filter(x => keyFights.includes(x));
      const strayCount = floor.strays.filter(x => keyFights.includes(x));

      // add display text for each theme's floors
      keyFormat[floor.theme] +=
        `**F${floor.floor}**:` +
        (guardianCount.length > 0 ? ` ${guardianCount.length} guardian` : '') +
        (strayCount.length > 0 ? ` ${strayCount.length} stray` : '') +
        '\n';
    }

    // create embed fields for each theme
    const fields = [];
    for (const theme in keyFormat)
      fields.push({name: theme, value: keyFormat[theme]});

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Week of ${week}`,
      })
      .setTitle(`Tower Key Fights`)
      .addFields(fields)
      .setThumbnail(
        'https://orna.guide/static/orna/img/monsters/tower_guardian.png'
      )
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
