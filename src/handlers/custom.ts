import {ColorResolvable, CommandInteraction, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {prisma} from './prisma';

const {FOOTER_MESSAGE, EMBED_COLOUR, BOT_OWNER} = config;

export const leadMonsters = prisma.encounter
  .findMany()
  .then(response => response.map(x => x.leader));

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

export function numberToWords(number: number): string {
  const ones = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
  ];
  const tens = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  var numString = number.toString();

  if (number < 0) throw new Error('Negative numbers are out of scope.');
  else if (number < 20) {
    return ones[number];
  } else if (numString.length === 2) {
    return tens[Number(numString[0])] + ' ' + ones[Number(numString[0])];
  } else throw new Error('Numbers above 100 are out of scope.');
}
