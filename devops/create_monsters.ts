import {prisma} from '../src/handlers/prisma';

const monsters = [
  {name: 'Anubis', berserk: false, statuses: []},
  {name: 'Arcane Troll', berserk: false, statuses: []},
  {name: 'Arisen Ankou', berserk: false, statuses: []},
  {name: 'Arisen Carman', berserk: false, statuses: []},
  {name: 'Arisen Demeter', berserk: false, statuses: []},
  {name: 'Arisen Fafnir', berserk: false, statuses: []},
  {name: 'Arisen Hydra', berserk: false, statuses: []},
  {name: 'Arisen Ithra', berserk: false, statuses: []},
  {name: 'Arisen King Meliodas', berserk: false, statuses: []},
  {name: 'Arisen Mimic King', berserk: false, statuses: []},
  {name: 'Arisen Thor', berserk: false, statuses: []},
  {name: 'Arisen Vulcan', berserk: false, statuses: []},
  {name: 'Baldr', berserk: false, statuses: []},
  {name: 'Balor King', berserk: false, statuses: []},
  {name: 'Balor Worm', berserk: false, statuses: []},
  {name: 'Carman', berserk: false, statuses: []},
  {name: 'Castor', berserk: false, statuses: []},
  {name: 'Chimera', berserk: false, statuses: []},
  {name: 'Dark Pegasus', berserk: false, statuses: []},
  {name: 'Dark Slime', berserk: false, statuses: ['t.all+++']},
  {name: 'Elite Kobold Lord', berserk: false, statuses: []},
  {name: 'Enlightened Prince', berserk: false, statuses: ['target--']},
  {name: 'Fallen Beowulf', berserk: false, statuses: []},
  {name: 'Fallen Deity', berserk: false, statuses: []},
  {name: 'Fallen Demeter', berserk: false, statuses: []},
  {name: 'Fallen Heretic', berserk: false, statuses: []},
  {name: 'Fallen Hero, Lover Lost', berserk: false, statuses: []},
  {name: 'Fallen Ithra', berserk: false, statuses: []},
  {name: 'Fallen Thor', berserk: false, statuses: []},
  {name: 'Fallen Vulcan', berserk: false, statuses: []},
  {name: 'Frost Troll', berserk: true, statuses: []},
  {name: 'Gorgon', berserk: true, statuses: []},
  {name: 'Hades', berserk: false, statuses: []},
  {name: 'Hati', berserk: false, statuses: []},
  {name: 'Immortal', berserk: false, statuses: ['t.att+++']},
  {name: 'Immortal Lord', berserk: false, statuses: []},
  {name: 'Immortal Magus', berserk: false, statuses: ['t.mag+++']},
  {name: 'Infernal Bear', berserk: true, statuses: []},
  {name: 'Kelpie', berserk: false, statuses: []},
  {name: 'King Gradlon', berserk: false, statuses: []},
  {name: 'Mammon Acolyte', berserk: false, statuses: []},
  {name: 'Mighty Griffin', berserk: false, statuses: []},
  {name: 'Nidhogg', berserk: false, statuses: []},
  {name: 'Nothren Valkyrie', berserk: false, statuses: []},
  {name: 'Odin', berserk: false, statuses: []},
  {name: 'Pegasus', berserk: false, statuses: []},
  {name: 'Ronin', berserk: false, statuses: []},
  {name: 'Skoll', berserk: false, statuses: []},
  {name: 'Succubus', berserk: false, statuses: []},
  {name: 'Tower Guard', berserk: false, statuses: []},
];

async function main() {
  const start = Date.now();

  const response = await prisma.monster.createMany({
    data: monsters,
    skipDuplicates: true,
  });

  console.log(`Added ${response.count} entries in ${Date.now() - start}ms`);
}

main().then(() => process.exit(0));
