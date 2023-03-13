import {FloorSubmission} from '@prisma/client';
import {ColorResolvable, EmbedBuilder} from 'discord.js';
import {config, towerConfig} from '../config';
import {prisma} from '../handlers';

const {FOOTER_MESSAGE, EMBED_COLOUR} = config;
const {towerSprites} = towerConfig;

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
