import {prisma} from '../src/handlers/prisma';

const encounters = [
  {leader: 'Anubis', tier: 10, monsters: ['Anubis']},
  {
    leader: 'Arcane Troll',
    tier: 10,
    monsters: ['Arcane Troll', 'Arcane Troll', 'Arcane Troll', 'Arcane Troll'],
  },
  {leader: 'Arisen Ankou', tier: 10, monsters: ['Arisen Ankou']},
  {
    leader: 'Arisen Carman',
    tier: 10,
    monsters: [
      'Arisen Carman',
      'Arisen Gargoyle',
      'Arisen Gargoyle',
      'Arisen Gargoyle',
      'Arisen Gargoyle',
    ],
  },
  {
    leader: 'Arisen Demeter',
    tier: 10,
    monsters: ['Arisen Demeter', 'Fallen Gaia', 'Fallen Gaia'],
  },
  {
    leader: 'Arisen Fafnir',
    tier: 10,
    monsters: [
      'Arisen Fafnir',
      'Nidhogg',
      'Arisen Typhon',
      'Arisen Tiamat',
      'Arisen Hydra',
    ],
  },
  {
    leader: 'Arisen Ithra',
    tier: 10,
    monsters: ['Arisen Ithra', 'Fallen Leviathan', 'Fallen Leviathan'],
  },
  {
    leader: 'Arisen King Meliodas',
    tier: 10,
    monsters: ['Arisen King Meliodas', 'Arisen King Meliodas'],
  },
  {
    leader: 'Arisen Mimic King',
    tier: 10,
    monsters: [
      'Arisen Mimic King',
      'Mammon Acolyte',
      'Anubis',
      'Nidhogg',
      'Mighty Yeti',
    ],
  },
  {
    leader: 'Arisen Thor',
    tier: 10,
    monsters: ['Arisen Thor', 'Fallen Taranis', 'Fallen Taranis'],
  },
  {
    leader: 'Arisen Vulcan',
    tier: 10,
    monsters: ['Arisen Vulcan', 'Fallen Ifrit', 'Fallen Ifrit'],
  },
  {
    leader: 'Baldr',
    tier: 10,
    monsters: [
      'Baldr',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
    ],
  },
  {
    leader: 'Balor King',
    tier: 10,
    monsters: ['Balor King', 'Balor Warlock', 'Balor Marauder', 'Balor Flame'],
  },
  {leader: 'Balor Worm', tier: 10, monsters: ['Balor Worm', 'Death Worm']},
  {leader: 'Carman', tier: 10, monsters: ['Carman']},
  {leader: 'Castor', tier: 10, monsters: ['Castor', 'Pollux']},
  {leader: 'Chimera', tier: 10, monsters: ['Chimera']},
  {
    leader: 'Dark Pegasus',
    tier: 10,
    monsters: [
      'Pegasus',
      'Pegasus',
      'Dark Pegasus',
      'Dark Pegasus',
      'Dark Pegasus',
    ],
  },
  {leader: 'Dark Slime', tier: 10, monsters: ['Dark Slime']},
  {
    leader: 'Elite Kobold Lord',
    tier: 10,
    monsters: [
      'Elite Kobold Lord',
      'Elite Kobold',
      'Elite Kobold',
      'Elite Kobold Mage',
      'Elite Kobold Mage',
    ],
  },
  {
    leader: 'Enlightened Prince',
    tier: 10,
    monsters: [
      'Enlightened Prince',
      'Enlightened Guardian',
      'Enlightened Mage',
    ],
  },
  {
    leader: 'Fallen Beowulf',
    tier: 10,
    monsters: ['Fallen Beowulf', 'Fey Cactus', 'Fey Cactus', 'Fey Cactus'],
  },
  {
    leader: 'Fallen Deity',
    tier: 10,
    monsters: [
      'Fallen Deity',
      'Fallen Gaia',
      'Fallen Leviathan',
      'Fallen Ifrit',
      'Fallen Taranis',
    ],
  },
  {leader: 'Fallen Demeter', tier: 10, monsters: ['Fallen Demeter']},
  {
    leader: 'Fallen Heretic',
    tier: 10,
    monsters: ['Fallen Heretic', 'Anubis', 'Anubis', 'Anubis'],
  },
  {
    leader: 'Fallen Hero, Lover Lost',
    tier: 10,
    monsters: ['Fallen Hero, Lover Lost'],
  },
  {leader: 'Fallen Ithra', tier: 10, monsters: ['Fallen Ithra']},
  {leader: 'Fallen Thor', tier: 10, monsters: ['Fallen Thor']},
  {leader: 'Fallen Vulcan', tier: 10, monsters: ['Fallen Vulcan']},
  {leader: 'Frost Troll', tier: 10, monsters: ['Frost Troll']},
  {leader: 'Gorgon', tier: 10, monsters: ['Gorgon']},
  {
    leader: 'Arisen Hydra',
    tier: 10,
    monsters: ['Arisen Hydra', 'Arisen Hydra', 'Arisen Hydra'],
  },
  {
    leader: 'Hades',
    tier: 10,
    monsters: [
      'Hades',
      'Final Stable Keeper',
      'Final Stable Keeper',
      'Final Stable Keeper',
      'Final Stable Keeper',
    ],
  },
  {
    leader: 'Hati',
    tier: 10,
    monsters: ['Hati', 'Skoll', 'Garm', 'Garm', 'Garm', 'Garm'],
  },
  {leader: 'Immortal', tier: 10, monsters: ['Immortal']},
  {
    leader: 'Immortal Lord',
    tier: 10,
    monsters: ['Immortal Lord', 'Immortal', 'Immortal', 'Immortal Magus'],
  },
  {leader: 'Immortal Magus', tier: 10, monsters: ['Immortal Magus']},
  {leader: 'Infernal Bear', tier: 10, monsters: ['Infernal Bear']},
  {leader: 'Kelpie', tier: 10, monsters: ['Kelpie', 'Kraken', 'Kraken']},
  {
    leader: 'King Gradlon',
    tier: 10,
    monsters: [
      'King Gradlon',
      'Lyonesse Knight',
      'Lyonesse Knight',
      'Lyonesse Assassin',
      'Lyonesse Warlock',
    ],
  },
  {
    leader: 'Mammon Acolyte',
    tier: 10,
    monsters: ['Mammon Acolyte', 'Mammon Acolyte'],
  },
  {
    leader: 'Mighty Griffin',
    tier: 10,
    monsters: ['Mighty Griffin', 'Griffin', 'Griffin', 'Griffin', 'Griffin'],
  },
  {leader: 'Nidhogg', tier: 10, monsters: ['Nidhogg']},
  {
    leader: 'Nothren Valkyrie',
    tier: 10,
    monsters: [
      'Nothren Valkyrie',
      'Elite Nothren Berserker',
      'Elite Nothren Raider',
      'Elite Nothren Warlock',
    ],
  },
  {
    leader: 'Odin',
    tier: 10,
    monsters: [
      'Odin',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
      'Elite Nothren Valkyrie',
    ],
  },
  {
    leader: 'Pegasus',
    tier: 10,
    monsters: ['Pegasus', 'Pegasus', 'Pegasus', 'Dark Pegasus', 'Dark Pegasus'],
  },
  {
    leader: 'Ronin',
    tier: 10,
    monsters: ['Ronin', 'Arisen Ronin', 'Arisen Ronin'],
  },
  {
    leader: 'Skoll',
    tier: 10,
    monsters: ['Skoll', 'Hati', 'Garm', 'Garm', 'Garm', 'Garm'],
  },
  {leader: 'Succubus', tier: 10, monsters: ['Succubus', 'Harpy', 'Harpy']},
  {
    leader: 'Tower Guard',
    tier: 10,
    monsters: ['Tower Guard', 'Tower Guard', 'Tower Guard', 'Tower Guardian'],
  },
];

async function main() {
  const start = Date.now();

  const response = await prisma.encounter.createMany({
    data: encounters,
    skipDuplicates: true,
  });

  console.log(`Added ${response.count} entries in ${Date.now() - start}ms`);
}

main().then(() => process.exit(0));
