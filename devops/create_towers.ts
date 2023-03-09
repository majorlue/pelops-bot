import {currentWeek, prisma} from '../src/handlers';

async function main() {
  const start = Date.now();
  const themes = ['Selene', 'Eos', 'Oceanus', 'Prometheus', 'Themis'];
  const weekStart = currentWeek();
  for (const theme of themes)
    await prisma.tower.create({data: {theme, week: weekStart}});

  console.log(`Create ${themes.length} entries in ${Date.now() - start}ms`);
}

main().then(() => process.exit(0));
