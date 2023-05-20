import {
  SlashCommandBuilder,
  SlashCommandStringOption,
} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {client, currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, CONTRIBUTION_REQUEST_MSG} = config;
const {themes, keyFights, towerSprites} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to view')
  .setRequired(true)
  .setChoices(...themeOpts);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('chestskeys')
    .setDescription(
      'Retrieve floors containing either chests or key encounters'
    )
    .addStringOption(themeOptions),
  run: async interaction => {
    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as
      | 'Selene'
      | 'Eos'
      | 'Oceanus'
      | 'Prometheus'
      | 'Themis';

    // db query for current week floors with key fights as either guardian or stray
    const floors = await prisma.floor.findMany({
      where: {
        week: week,
        theme: theme,
        // db query for floors with chests and/or key fights
        OR: [
          {
            // key fights can be either guardians or strays, so OR both columns
            OR: [
              {guardians: {hasSome: keyFights}},
              {strays: {hasSome: keyFights}},
            ],
          },
          // select greater than (gt) 0 chests
          {chests: {gt: 0}},
        ],
      },
    });

    // If no floors found, return empty message
    if (floors.length === 0) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: `${theme} | Week of ${week}`,
            })
            .setDescription(`No Tower info found for ${theme} ${week}`)
            .setThumbnail(towerSprites[theme])
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setFooter({text: FOOTER_MESSAGE})
            .setTimestamp(),
        ],
      });
      return;
    }

    // sort key floors in ascending order
    floors.sort((a, b) => a.floor - b.floor);

    // pull emoji IDs from client cache, no need to fetch fresh
    const chestEmoji = client.emojis.cache.find(
      emoji => emoji.name === 'tower_chest'
    );
    const keyEmoji = client.emojis.cache.find(
      emoji => emoji.name === 'tower_key'
    );

    const floorText: string[] = [];
    let embedNum = 0;
    for (const floor of floors) {
      const {floor: floorNum, chests} = floor;
      const guardianCount = floor.guardians.filter(x =>
        keyFights.includes(x)
      ).length;
      const strayCount = floor.strays.filter(x => keyFights.includes(x)).length;
      const keyCount = guardianCount + strayCount;

      // add display text for each theme's floors
      let text = floorNum >= 10 ? `\`F${floorNum}\`: ` : `\` F${floorNum}\`: `;
      // repeat chest/key emoji to indicate count for that floor
      if (chests) text += `${chestEmoji} `.repeat(chests);
      if (keyCount)
        text +=
          `${keyEmoji} `.repeat(keyCount) +
          // specify guardian or stray in brackets, using one char per fight
          `(${'G'.repeat(guardianCount)}${'S'.repeat(strayCount)})`;

      // if the length would exceed discord's limit, instead create another embed
      if (!floorText[embedNum]) floorText[embedNum] = '\u200b';
      else if (floorText[embedNum].length + text.length > 4000) embedNum++;

      floorText[embedNum] += text + '\n';
    }

    const responseEmbeds = [];
    for (const embedText of floorText)
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `${theme} | Week of ${week}`,
          })
          .setDescription(
            embedText + '\n`G` = Floor Guardian | `S` = Stray Monster'
          )
          .setThumbnail(towerSprites[theme])
          .setColor(EMBED_COLOUR as ColorResolvable)
      );

    // add contribution request, footer message and timestamp to final embed. no need to display on all
    responseEmbeds[responseEmbeds.length - 1]
      .addFields({
        name: `\u200b`,
        value: CONTRIBUTION_REQUEST_MSG,
      })
      .setFooter({text: FOOTER_MESSAGE})
      .setTimestamp();

    await interaction.editReply({embeds: responseEmbeds});
  },
};

export default command;
