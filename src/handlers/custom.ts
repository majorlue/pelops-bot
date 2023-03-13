import {FloorSubmission} from '@prisma/client';
import {ColorResolvable, CommandInteraction, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {prisma} from '.';

const {FOOTER_MESSAGE, EMBED_COLOUR, BOT_OWNER} = config;
const {towerSprites} = towerConfig;

export const leadMonsters = prisma.encounter
  .findMany()
  .then(response => response.map(x => x.leader));

export async function approveSubmission(submission: FloorSubmission) {
  const {id, chest, floor, guardian, puzzle, stray, theme, week} = submission;

  // upsert to current tower theme
  // insert db entry for approved tower floors
  await prisma.floor.upsert({
    where: {
      theme_week_floor: {theme, week, floor},
    },
    // if floor entry doesn't exist for the week, create it
    create: {
      // create tower entry if it doesn't exist, otherwise add relation
      tower: {
        connectOrCreate: {
          create: {theme, week},
          where: {theme_week: {theme, week}},
        },
      },
      floor: floor,
      guardians: guardian ? [guardian] : undefined,
      strays: stray ? [stray] : undefined,
      puzzles: puzzle ? [puzzle] : undefined,
      chests: chest !== null ? chest : undefined,
    },
    // if floor entry exists, update it
    update: {
      // create tower entry if it doesn't exist, otherwise add relation
      tower: {
        connectOrCreate: {
          create: {theme, week},
          where: {theme_week: {theme, week}},
        },
      },
      floor: floor,
      guardians: {push: guardian ? guardian : []},
      strays: {push: stray ? stray : []},
      puzzles: {push: puzzle ? puzzle : []},
      chests: chest,
    },
  });

  // remove submission entry now that it's approved
  await prisma.floorSubmission.delete({where: {id}});

  const embedFields: {name: string; value: string; inline?: boolean}[] = [];
  if (guardian) embedFields.push({name: 'Floor Guardian', value: guardian});
  if (stray) embedFields.push({name: 'Stray Monster', value: stray});
  if (chest) embedFields.push({name: 'Chest Count', value: chest.toString()});
  if (puzzle) embedFields.push({name: 'Puzzle', value: puzzle});

  const responseEmbed = new EmbedBuilder()
    .setTitle(`${theme} F${floor} Updated`)
    .setFields(...embedFields)
    .setThumbnail(
      towerSprites[
        (theme as 'Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis')
      ]
    )
    .setFooter({text: FOOTER_MESSAGE})
    .setColor(EMBED_COLOUR as ColorResolvable)
    .setTimestamp();

  return responseEmbed;
}

export async function checkPerms(userId: string) {
  const owners = [BOT_OWNER];
  const admins = (await prisma.admin.findMany()).map(x => x.id);
  const contribs = (await prisma.contributor.findMany()).map(x => x.id);

  const permsObj = {
    owner: [...owners].includes(userId),
    admin: [...owners, ...admins].includes(userId),
    contrib: [...owners, ...admins, ...contribs].includes(userId),
  };
  return permsObj;
}

export function monsterNotFoundEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `Tower Floor Submission`,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Invalid Input`)
        .setDescription(
          'Monster not found. Please use one of the provided responses!'
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function ownerCommandEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Permission Denied`)
        .setDescription('This command is only available to Owners!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function adminCommandEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Permission Denied`)
        .setDescription('This command is only available to Admins!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function contribCommandEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || '',
        })
        .setTitle(`Permission Denied`)
        .setDescription('This command is only available to Contributors!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}
