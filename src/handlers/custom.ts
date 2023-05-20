import {ColorResolvable, CommandInteraction, EmbedBuilder} from 'discord.js';
import {client, currentWeek, dayjs} from '.';
import {config, towerConfig} from '../config';
import {prisma} from './prisma';

const {FOOTER_MESSAGE, EMBED_COLOUR, BOT_OWNER} = config;
const {themes, keyFights} = towerConfig;

// retrieve tower encounters, sorting key encounters first, then alphabetically
export const leadMonsters = prisma.encounter.findMany().then(response => {
  const leads = response.map(x => x.leader);
  return [
    // place key encounters first in array, then the rest
    ...leads.filter(x => keyFights.includes(x)),
    ...leads.filter(x => !keyFights.includes(x)),
  ];
});

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

export function currentHeightsEmbed() {
  // get time when command was sent, and get UTC time values
  const date = new Date();
  const day = date.getUTCDay(); // sunday is 0 with 6 being Saturday
  const hour = date.getUTCHours();
  const minutes = date.getUTCMinutes();

  // define current themes, and the formula for their heights
  const towers = [
    {
      name: 'Selene',
      floors: currentFloors(day, hour, 'Sunday'),
    },
    {
      name: 'Eos',
      floors: currentFloors(day, hour, 'Monday'),
    },
    {
      name: 'Oceanus',
      floors: currentFloors(day, hour, 'Tuesday'),
    },
    {
      name: 'Themis',
      floors: currentFloors(day, hour, 'Wednesday'),
    },
    {
      name: 'Prometheus',
      floors: currentFloors(day, hour, 'Thursday'),
    },
  ];
  // sort array by tower heights
  towers.sort((a, b) => Number(b.floors) - Number(a.floors));

  // calculate longest tower theme name
  const longestThemeName = [...towers].sort(
    (x, y) => y.name.length - x.name.length
  )[0].name.length;

  // use a language-formatted code block for Tower heights display
  let floorEmbed = '';

  // populate tower heights display block with a specific format
  towers.forEach(tower => {
    floorEmbed +=
      // format block to be evenly spaced and right-aligned
      (tower.name.length < longestThemeName
        ? // if name is shorter than the longest theme, fill from left with spaces
          `\`${' '.repeat(longestThemeName - tower.name.length) + tower.name}\``
        : // if it is the longest theme name, no need to fill spaces
          `\`${tower.name}\``) +
      // append current floor count
      `: **${tower.floors}**\n`;
  });

  // build embed for the command
  return new EmbedBuilder()
    .setTitle('Floor Heights - Towers of Olympia')
    .addFields(
      {
        // second header text for current UTC display and insert heights code block
        name: `${dayjs.utc(date).format('dddd HHmm')} UTC`,
        value: floorEmbed,
      },
      {
        name: '\u200b',
        value: `Towers last grew <t:${floorsLastAdded()}:R>, and will grow again <t:${floorsGrowAt()}:R>`,
      }
    )
    .setFooter({text: FOOTER_MESSAGE})
    .setColor(EMBED_COLOUR as ColorResolvable)
    .setTimestamp();
}

export async function currentKeysEmbed() {
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

  // return embed for the command
  return new EmbedBuilder()
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
}

export function missingChannelPerms(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(`Permission Denied`)
        .setDescription('This can only be used by server moderators!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function monsterNotFoundEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: `Tower Floor Submission`,
          iconURL: interaction.user.avatarURL() || undefined,
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
          iconURL: interaction.user.avatarURL() || undefined,
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
          iconURL: interaction.user.avatarURL() || undefined,
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
          iconURL: interaction.user.avatarURL() || undefined,
        })
        .setTitle(`Permission Denied`)
        .setDescription('This command is only available to Contributors!')
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function commandErrorEmbed(interaction: CommandInteraction) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: client.user?.tag || '',
          iconURL: client.user?.avatarURL() || undefined,
        })
        .setTitle(`Something Went Wrong )=`)
        .setDescription(
          `There was an issue trying to execute \`/${interaction.commandName}\`! ` +
            `The issue has been logged and will be looked into. Feel free to try again shortly. ` +
            `If the problem persists, please submit a bug report in the Cade Labs Discord (\`/discord\`).`
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function devErrorEmbed(interaction: CommandInteraction, error: Error) {
  return {
    embeds: [
      new EmbedBuilder()
        .setAuthor({
          name: client.user?.tag || '',
          iconURL: client.user?.avatarURL() || undefined,
        })
        .setTitle(`Error Encountered`)
        .setDescription(`Caught exception. Details below:`)
        .setFields(
          {
            name: 'Internal Error Message',
            value: error.message || '\u200b',
          },
          {
            name: 'Interaction',
            value: `\`/${interaction.commandName}\`` || '\u200b',
          },
          {
            name: 'Interaction Options',
            value: JSON.stringify(interaction.options.data) || '\u200b',
          },
          {
            name: 'Interaction User',
            value: interaction.user.tag || '\u200b',
          },
          {
            name: 'Interaction Guild',
            value:
              `${interaction.guild?.name} (\`${interaction.guildId}\`)` ||
              '\u200b',
          }
        )
        .setFooter({text: FOOTER_MESSAGE})
        .setColor(EMBED_COLOUR as ColorResolvable)
        .setTimestamp(),
    ],
  };
}

export function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
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

// array for current floors based on hour (index)
const currDayFloors = [
  0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5,
];

// array for JS' day int to string
const weekdays = [
  'Sunday',
  'Saturday',
  'Friday',
  'Thursday',
  'Wednesday',
  'Tuesday',
  'Monday',
];

/**
 * Calculate Tower Height based on specified reset day and time
 * @param day Current UTC day, as integer
 * @param hour Current UTC hour, as integer
 * @param reset UTC day for reset, as integer
 * @returns Tower Height, as integer
 */
const currentFloors = (
  day: number,
  hour: number,
  reset: (typeof weekdays)[number]
) => {
  /**
   * Tower Floors:
   * - 15 minimum, 50 maximum
   * - gains up to 5 floors per day at specific (uneven) times
   * - each theme resets to 15 floors on different days
   */
  // retrieve integer value for current weekday
  const resetDay = weekdays.indexOf(reset);
  // calculate number of FULL days since this tower's reset
  const daysSinceReset = (day + resetDay) % 7;
  // calculate number of floors gained in the current day
  const dayFloors = currDayFloors[hour]; // arr index is hour, mapped to current day's floors

  return 15 + 5 * daysSinceReset + dayFloors;
};

/**
 * Credit to @Knight411 for the initial code behind these two functions, cheers <3
 */
const towerGrowTimes = [1, 5, 10, 15, 20, 25]; // mystical "25th hour" thought of by knight
export function floorsGrowAt() {
  const time = dayjs().utc();
  let growsAt = dayjs().utc();
  // iterate through hours that towers grow, find FIRST time that hasn't yet passed
  for (const hour of towerGrowTimes)
    if (time.hour() < hour) {
      // set the grows at time to this, zeroing out the minutes at seconds
      // keeps the date and hour (and ms, but that doesn't change things)
      growsAt = growsAt.set('hour', hour).set('minute', 0).set('second', 0);
      break;
    }
  // return time since unix epoch for use with discord formatting or typescript
  return growsAt.unix();
}

const towerGrewTimes = [1, 5, 10, 15, 20];
export function floorsLastAdded() {
  const time = dayjs().utc();
  let grewAt = dayjs().utc();
  // iterate through hours that towers grew, find LAST time that hasn't yet passed
  for (const hour of towerGrewTimes)
    if (time.hour() >= hour)
      // set the grew at time to this, zeroing out the minutes at seconds
      // keeps the date and hour (and ms, but that doesn't change things)
      grewAt = grewAt.set('hour', hour).set('minute', 0).set('second', 0);

  // return time since unix epoch for use with discord formatting or typescript
  return grewAt.unix();
}
