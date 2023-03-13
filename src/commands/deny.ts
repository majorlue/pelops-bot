import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {botConfig, config} from '../config';
import {prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {adminChannels} = botConfig;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('deny')
    .setDescription('Deny floor submission')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('Submission ID to remove')
        .setRequired(true)
    ),
  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: false});

    // return if not used in an admin channel (allows multiple mods by default)
    if (!adminChannels.includes(interaction.channelId)) return;

    const id = interaction.options.get('id')?.value as string;
    const {chest, floor, guardian, puzzle, stray, theme, user, week} =
      await prisma.floorSubmission.findUniqueOrThrow({where: {id}});

    // remove submission entry now that it's denied
    await prisma.floorSubmission.delete({where: {id}});

    // populate embed fields as exists in db
    const embedFields: {name: string; value: string; inline?: boolean}[] = [];
    if (guardian) embedFields.push({name: 'Floor Guardian', value: guardian});
    if (stray) embedFields.push({name: 'Stray Monster', value: stray});
    if (chest) embedFields.push({name: 'Chest Count', value: chest.toString()});
    if (puzzle) embedFields.push({name: 'Puzzle', value: puzzle});

    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        name: interaction.user.tag,
        iconURL: interaction.user.avatarURL() || '',
      })
      .setTitle(`${theme} F${floor} Submission Denied`)
      .setFields(...embedFields)
      .setThumbnail('https://orna.guide/static/orna/img/towers/1_3.png')
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
