import {SlashCommandBuilder} from '@discordjs/builders';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config} from '../config';
import {Command} from '../interfaces/command';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('floors')
    .setDescription('List current Tower floor counts.'),
  run: async interaction => {
    // Discord requires acknowledgement within 3 seconds, so just defer reply for now
    await interaction.deferReply({ephemeral: true});

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
    let floorEmbed = `\`\`\`prolog\n`;

    // populate tower heights display block with a specific format
    towers.forEach(tower => {
      floorEmbed +=
        // format block to be evenly spaced and right-aligned
        (tower.name.length < longestThemeName
          ? // if name is shorter than the longest theme, fill from left with spaces
            `${' '.repeat(longestThemeName - tower.name.length) + tower.name}`
          : // if it is the longest theme name, no need to fill spaces
            `${tower.name}`) +
        // append current floor count
        `: ${tower.floors}\n`;
    });

    // close code block
    floorEmbed += `\`\`\``;

    // build embed for the command
    const responseEmbed = new EmbedBuilder()
      .setAuthor({
        // not actually author, just the top-most header text
        name: 'Floor Heights - Towers of Olympia',
      })
      .addFields({
        // second header text for current UTC display and insert heights code block
        name: `${weekdays[day]} ${hour < 10 ? `0${hour}` : hour}${minutes} UTC`,
        value: floorEmbed,
      })
      .setFooter({text: FOOTER_MESSAGE})
      .setColor(EMBED_COLOUR as ColorResolvable)
      .setTimestamp();

    await interaction.editReply({embeds: [responseEmbed]});
  },
};

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

export default command;
