import {SlashCommandBuilder} from '@discordjs/builders';
import axios from 'axios';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {Monster, prisma} from '../handlers';
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

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        // not actually author, just the top-most header text
        name: `Monster Encounter`,
      })
      .setFooter({
        // the small text at the bottom
        text: config.BOT_FOOTER_MESSAGE,
      })
      // cute
      .setColor(config.BOT_EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    // promise of enemies formatted for display
    const enemies: Promise<string>[] = [];

    // retrieve db entries for encounter monsters
    await prisma.monster
      .findMany({
        where: {name: {in: encounter.monsters}},
      })
      .then(async prismaEntries => {
        // iterate over each enemy in the encounter, pushing an enemy's embed string
        for (const monster of encounter.monsters) {
          // retrieve curr monster
          const prismaEntry = prismaEntries.find(x => x.name === monster);
          if (!prismaEntry) throw Error();

          // query Ethi's API for monster image/codex uri
          enemies.push(
            axios
              .post('https://ornapi.cadelabs.ovh/api/v0.1/monsters', {
                name: monster,
              })
              .then(response => {
                const data = response.data[0];
                // if curr monster is the leader, set its image as the embed thumbnail
                if (monster === encounter.leader)
                  responseEmbed.setThumbnail(
                    config.ORNAGUIDE_IMAGE_PREFIX + data['image_name']
                  );

                const codexURL = config.CODEX_PREFIX + data['codex_uri'];
                const monsterEmbed =
                  // bold monster name and, using markdown, insert hyperlink to its codex entry
                  `**[${monster}](${codexURL})**` +
                  // if the monster has any statuses, display it in parentheses
                  (prismaEntry.statuses.length
                    ? ` (${prismaEntry.statuses.join(', ')})`
                    : '');
                return monsterEmbed;
              })
          );
        }
      });

    responseEmbed.addFields({
      name: 'Enemies',
      value: (await Promise.all(enemies)).join('\n\n'),
    });
    // now that processing is done, edit original message with the populated embed
    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
