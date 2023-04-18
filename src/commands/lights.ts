import {SlashCommandBuilder} from '@discordjs/builders';
import axios, {AxiosHeaders} from 'axios';
import {
  Attachment,
  ColorResolvable,
  EmbedBuilder,
  GuildEmoji,
} from 'discord.js';
import FormData from 'form-data';
import {config, towerConfig} from '../config';
import {client} from '../handlers';
import {Command} from '../interfaces/command';

const {FOOTER_MESSAGE, EMBED_COLOUR, LIGHTS_SOLVER} = config;
const {puzzleSprites} = towerConfig;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('lights')
    .setDescription('Solve a Light puzzle via screenshot')
    .addAttachmentOption(attachment =>
      attachment
        .setName('screenshot')
        .setDescription('Puzzle screenshot')
        .setRequired(true)
    ),
  run: async interaction => {
    const image = interaction.options.data[0].attachment as Attachment;

    // get data stream from discord attachment link
    const {data: stream} = await axios.get(image.url, {
      responseType: 'stream',
    });
    // create new form and append image to it
    const formData = new FormData();
    formData.append('image', stream);

    // upload image using multipart to akin's API (THANKS MATE)
    const response = await axios.post(LIGHTS_SOLVER, formData, {
      headers: {
        headers: formData.getHeaders() as AxiosHeaders,
      },
    });
    console.log(response.data);

    if (
      response.data ===
        'Could not find the board in the image. Make sure there are no color filters and no visual obstructions' ||
      response.data === 'Board is invalid'
    ) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Lights Puzzle Solver`)
            .setDescription(
              `There was an issue parsing the image. Please ensure there are no colour filters or obstructions!`
            )
            .setThumbnail(puzzleSprites.lights)
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp(),
        ],
      });
      return;
    }

    // console.log(data);
    // format solver API response, split into array
    const lightsData = (response.data as string)
      .replace('Solution:', '')
      .split('Board:');
    // remove commas, spaces and pipes
    lightsData[0] = lightsData[0].split(', ').join('').split('|').join('');
    lightsData[1] = lightsData[1].split(', ').join('').split('|').join('');

    // fetch rune emojis in the format 1a, 1c etc. a = unlit, c = lit
    const runes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const litRunes: GuildEmoji[] = [];
    const unlitRunes: GuildEmoji[] = [];
    for (const name of runes) {
      unlitRunes.push(
        client.emojis.cache.find(
          emoji => emoji.name === `${name}a`
        ) as GuildEmoji
      );
      litRunes.push(
        client.emojis.cache.find(
          emoji => emoji.name === `${name}c`
        ) as GuildEmoji
      );
    }

    // replace Xs and Os with runes one by one so it's a nice, random rune board
    for (let i = 0; i < lightsData[0].length; i++) {
      lightsData[0] = lightsData[0].replace(
        'O',
        `${litRunes[Math.floor(Math.random() * runes.length)]}`
      );
      lightsData[0] = lightsData[0].replace(
        'X',
        `${unlitRunes[Math.floor(Math.random() * runes.length)]}`
      );
      lightsData[1] = lightsData[1].replace(
        'O',
        `${litRunes[Math.floor(Math.random() * runes.length)]}`
      );
      lightsData[1] = lightsData[1].replace(
        'X',
        `${unlitRunes[Math.floor(Math.random() * runes.length)]}`
      );
    }

    const responseEmbed = new EmbedBuilder()
      .setTitle(`Lights Puzzle Solver`)
      .setDescription(
        `Press each lit rune in any order to solve this puzzle =)`
      )
      .addFields(
        {
          name: 'Solution',
          value: lightsData[0],
        },
        {
          name: 'Board',
          value: lightsData[1],
        },
        {
          name: '\u200b',
          value: `Massive thanks to @Akintunde for providing the parser and solver for this command <3`,
        }
      )
      .setThumbnail(puzzleSprites.lights)
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
