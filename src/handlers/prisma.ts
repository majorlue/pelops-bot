import {PrismaClient} from '@prisma/client';

// Initialise Prisma client and expose generated functions
export const prisma = new PrismaClient();

export {Encounter, Floor, Monster, Prisma, Tower} from '@prisma/client';
