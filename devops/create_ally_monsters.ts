import {prisma} from '../src/handlers/prisma';

const monsters = [
  'Anubis',
  'Arcane Troll',
  'Arisen Ankou',
  'Arisen Carman',
  'Arisen Demeter',
  'Arisen Fafnir',
  'Arisen Gargoyle',
  'Arisen Hydra',
  'Arisen Ithra',
  'Arisen King Meliodas',
  'Arisen Mimic King',
  'Arisen Ronin',
  'Arisen Thor',
  'Arisen Tiamat',
  'Arisen Typhon',
  'Arisen Vulcan',
  'Baldr',
  'Balor Flame',
  'Balor King',
  'Balor Marauder',
  'Balor Warlock',
  'Balor Worm',
  'Carman',
  'Castor',
  'Chimera',
  'Dark Pegasus',
  'Dark Slime',
  'Death Worm',
  'Elite Kobold',
  'Elite Kobold Lord',
  'Elite Kobold Mage',
  'Elite Nothren Berserker',
  'Elite Nothren Raider',
  'Elite Nothren Valkyrie',
  'Elite Nothren Warlock',
  'Enlightened Guardian',
  'Enlightened Mage',
  'Enlightened Prince',
  'Fallen Beowulf',
  'Fallen Deity',
  'Fallen Demeter',
  'Fallen Gaia',
  'Fallen Heretic',
  'Fallen Hero, Lover Lost',
  'Fallen Ifrit',
  'Fallen Ithra',
  'Fallen Leviathan',
  'Fallen Taranis',
  'Fallen Thor',
  'Fallen Vulcan',
  'Fey Cactus',
  'Final Stable Keeper',
  'Frost Troll',
  'Garm',
  'Gorgon',
  'Griffin',
  'Hades',
  'Harpy',
  'Hati',
  'Immortal',
  'Immortal Lord',
  'Immortal Magus',
  'Infernal Bear',
  'Kelpie',
  'King Gradlon',
  'Kraken',
  'Lyonesse Assassin',
  'Lyonesse Knight',
  'Lyonesse Warlock',
  'Mammon Acolyte',
  'Mighty Griffin',
  'Mighty Yeti',
  'Nidhogg',
  'Nothren Valkyrie',
  'Odin',
  'Pegasus',
  'Pollux',
  'Ronin',
  'Skoll',
  'Succubus',
  'Tower Guard',
  'Tower Guardian',
];

async function main() {
  const start = Date.now();

  const leadMonsters = await prisma.monster.findMany();
  const leadMonsterList: string[] = [];
  leadMonsters.forEach(monster => leadMonsterList.push(monster.name));

  const allyMonsters: Record<'name', string>[] = [];

  const filteredMonsters = monsters
    .sort()
    .filter(monster => !leadMonsterList.includes(monster));

  filteredMonsters.forEach(x => allyMonsters.push({name: x}));

  const response = await prisma.monster.createMany({
    data: allyMonsters,
    skipDuplicates: true,
  });

  console.log(`Added ${response.count} entries in ${Date.now() - start}ms`);
}

main().then(() => process.exit(0));
