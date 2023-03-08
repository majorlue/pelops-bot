/*
  Warnings:

  - You are about to drop the `_EncounterToMonster` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EncounterToMonster" DROP CONSTRAINT "_EncounterToMonster_A_fkey";

-- DropForeignKey
ALTER TABLE "_EncounterToMonster" DROP CONSTRAINT "_EncounterToMonster_B_fkey";

-- AlterTable
ALTER TABLE "encounters" ADD COLUMN     "monsters" TEXT[];

-- DropTable
DROP TABLE "_EncounterToMonster";
