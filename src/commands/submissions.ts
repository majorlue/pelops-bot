import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
} from '@discordjs/builders';
import axios from 'axios';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import client from '..';
import {botConfig, config, towerConfig} from '../config';
import {currentWeek, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR, IMAGE_PATH} = config;
const {adminChannels} = botConfig;

const {maxHeight, minHeight, themes} = towerConfig;
const themeOpts = themes.map(x => ({name: x, value: x}));

const themeOptions = new SlashCommandStringOption()
  .setName('theme')
  .setDescription('Tower Theme to submit')
  .setRequired(true)
  .setChoices(...themeOpts);

const floorOptions = new SlashCommandIntegerOption()
  .setName('floor')
  .setDescription('Floor Number to submit')
  .setRequired(false)
  .setMinValue(minHeight)
  .setMaxValue(maxHeight);

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('submissions')
    .setDescription('Retrieve floor submissions')
    .addStringOption(themeOptions)
    .addIntegerOption(floorOptions),
  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: true});

    // return if not used in an admin channel (allows multiple mods by default)
    if (!adminChannels.includes(interaction.channelId)) return;

    const week = currentWeek();
    const theme = interaction.options.get('theme')?.value as string;
    const floor = interaction.options.get('floor')?.value as number;
    const submissions = await prisma.floorSubmission.findMany({
      where: {week, theme, floor},
      take: 10,
    });

    const responseEmbeds = [];
    for (const submission of submissions) {
      const {id, user, theme, floor, chest, guardian, puzzle, stray} =
        submission;
      const userObj = (await (
        await client.users.fetch(user)
      ).toJSON()) as Record<string, unknown>;
      const submissionEmbed = new EmbedBuilder()
        .setAuthor({
          name: (userObj.tag as string) + ' | ' + `${theme} F${floor}`,
          iconURL: userObj.avatarURL as string,
        })
        .addFields({name: 'Submission UID', value: id})
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp();

      if (guardian || stray) {
        const {image_name} = (
          await axios.post('https://ornapi.cadelabs.ovh/api/v0.1/monsters', {
            name: guardian || stray,
          })
        ).data[0];
        const type = guardian ? 'Floor Guardian' : 'Stray Monster';
        submissionEmbed
          .setTitle(type)
          .setThumbnail(IMAGE_PATH + image_name)
          .setDescription(guardian || stray);
      } else if (puzzle || chest !== null) {
        const type = puzzle ? 'Tower Puzzle' : 'Chest Count';
        submissionEmbed
          .setTitle(type)
          .setDescription(puzzle || chest?.toString() || '');
      }

      responseEmbeds.push(submissionEmbed);
    }

    if (responseEmbeds.length === 0)
      responseEmbeds.push(
        new EmbedBuilder()
          .setAuthor({
            name: `${theme}`,
          })
          .addFields({name: 'No Floors Submitted', value: 'Try again later!'})
          .setFooter({text: FOOTER_MESSAGE})
          .setColor(EMBED_COLOUR as ColorResolvable)
          .setTimestamp()
      );

    await interaction.editReply({embeds: responseEmbeds});
  },
};

export default command;
