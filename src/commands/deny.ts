import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {botConfig, config, towerConfig} from '../config';
import {logger, prisma} from '../handlers';
import {Command} from '../interfaces';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {towerSprites} = towerConfig;
const {administrators} = botConfig;

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
    await interaction.deferReply({ephemeral: true});

    // return if user is not a bot administrator
    if (!administrators.includes(interaction.user.id)) {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: interaction.user.tag,
              iconURL: interaction.user.avatarURL() || '',
            })
            .setTitle(`Permission Denied`)
            .setDescription(
              'Only bot administrators may use this command, sorry!'
            )
            .setFooter({text: FOOTER_MESSAGE})
            .setColor(EMBED_COLOUR as ColorResolvable)
            .setTimestamp(),
        ],
      });
      // exit, as anauthenticated
      return;
    }

    const id = interaction.options.get('id')?.value as string;
    const {chest, floor, guardian, puzzle, stray, theme, week} =
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
      .setThumbnail(
        towerSprites[
          (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
        ]
      )
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    // logging human-readable command information
    const {tag: user} = interaction.user;
    logger.info(`${user} denied submission for ${theme} F${floor}`, {
      command: command.data.name,
      type: 'info',
      user: user,
    });

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

export default command;
