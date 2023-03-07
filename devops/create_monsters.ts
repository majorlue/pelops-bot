import {prisma} from '../src/handlers';

async function main() {
  await prisma.monster.createMany({
    data: [{name: 'Fallen Beowulf'}, {name: 'Fey Cactus'}],
  });

  const encounter = await prisma.encounter.create({
    data: {
      leader: 'Fallen Beowulf',
      tier: 10,
      monsters: {
        create: [
          {monsterName: 'Fallen Beowulf', count: 1},
          {monsterName: 'Fey Cactus', count: 3},
        ],
      },
    },
    include: {
      monsters: {include: {monster: {select: {statuses: true, berserk: true}}}},
    },
  });

  console.log(JSON.stringify(encounter));
}

main().then(() => process.exit(0));
