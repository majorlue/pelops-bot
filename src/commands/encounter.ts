import {SlashCommandBuilder} from '@discordjs/builders';
import axios from 'axios';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {prisma} from '../handlers';
import {Command} from '../interfaces/command';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('encounter')
    .setDescription('List Towers encounter information')
    .addStringOption(option =>
      option
        .setName('monster')
        .setDescription('Lead monster to search for')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  run: async interaction => {
    // defer reply, so Discord gets the required response within 3 seconds
    await interaction.deferReply({ephemeral: true});

    const userQuery = interaction.options.get('monster')?.value;
    const encounter = await prisma.encounter.findUnique({
      where: {leader: userQuery as string},
    });

    // TODO: err msg
    if (!encounter) return;

    // query ethi's API for the lead monster name
    const apiResp = (
      await axios.post('https://ornapi.cadelabs.ovh/api/v0.1/monsters', {
        name: encounter.leader,
      })
    ).data[0]; // extract first item in data response

    // construct image and codex URLs using ethi's URI and config prefixes
    const imageURL = config.ORNAGUIDE_IMAGE_PREFIX + apiResp['image_name'];
    const codexURL = config.CODEX_PREFIX + apiResp['codex_uri'];

    // populate embed field value for every monster in the encounter
    let enemiesDesc = '';
    for (const monster of encounter.monsters) {
      // retrieve db entry for curr monster
      const prismaEntry = await prisma.monster.findFirstOrThrow({
        where: {name: monster},
      });

      // bolded monster name, hyperlinked to the online codex entry
      enemiesDesc += `**[${monster}](${codexURL})**`;
      // show monster statuses in parentheses
      if (prismaEntry.statuses.length)
        enemiesDesc += ` (${prismaEntry.statuses.join(', ')})`;
      enemiesDesc += '\n\n';
    }

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        // not actually author, just the top-most header text
        name: `Monster Encounter`,
      })
      .addFields({name: 'Enemies', value: enemiesDesc})
      .setThumbnail(imageURL)
      .setFooter({
        // the small text at the bottom
        text: config.BOT_FOOTER_MESSAGE,
      })
      // cute
      .setColor(config.BOT_EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    // now that processing is done, edit original message with the populated embed
    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
