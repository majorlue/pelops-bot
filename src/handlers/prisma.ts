import {PrismaClient} from '@prisma/client';

// Initialise Prisma client and expose generated functions
export const prisma = new PrismaClient();

export {Prisma, Monster, Encounter, Floor, Tower} from '@prisma/client';
