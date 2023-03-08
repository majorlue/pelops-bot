import {prisma} from '../src/handlers/prisma';

async function main() {
  const start = Date.now();

  // to update:
  const beserkMonsters: string[] = ['Frost Troll', 'Gorgon', 'Infernal Bear'];
  const statusMonsters: Record<string, string> = {
    'Dark Slime': 'T.All+++',
    'Enlightened Prince': 'Target--',
    Immortal: 'T.Att+++',
    'Immortal Magus': 'T.Mag+++',
    'Fallen Hero, Lover Lost': 'T.Def+++',
  };

  // appending Berserk to the status list of each berserk monster
  for (const monster of beserkMonsters) {
    const {id} = await prisma.monster.findFirstOrThrow({
      where: {name: monster},
    });
    await prisma.monster.update({
      where: {id},
      data: {statuses: {push: 'Berserk'}},
    });
  }

  // updating monster statuses to be properly capitalised
  for (const monster in statusMonsters) {
    const {id} = await prisma.monster.findFirstOrThrow({
      where: {name: monster},
    });
    await prisma.monster.update({
      where: {id},
      data: {statuses: {set: [statusMonsters[monster]]}},
    });
  }

  const updated = beserkMonsters.length + Object.keys(statusMonsters).length;
  console.log(`Updated ${updated} entries in ${Date.now() - start}ms`);
}

main().then(() => process.exit(0));
