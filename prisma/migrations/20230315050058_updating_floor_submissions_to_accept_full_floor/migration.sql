/*
  Warnings:

  - You are about to drop the column `chest` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `guardian` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `puzzle` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `stray` on the `floor_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "floor_submissions" DROP COLUMN "chest",
DROP COLUMN "guardian",
DROP COLUMN "puzzle",
DROP COLUMN "stray",
ADD COLUMN     "chests" INTEGER,
ADD COLUMN     "guardians" TEXT[],
ADD COLUMN     "puzzles" TEXT[],
ADD COLUMN     "strays" TEXT[];
