/*
  Warnings:

  - You are about to drop the column `chests` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `guardians` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `puzzles` on the `floor_submissions` table. All the data in the column will be lost.
  - You are about to drop the column `strays` on the `floor_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "floor_submissions" DROP COLUMN "chests",
DROP COLUMN "guardians",
DROP COLUMN "puzzles",
DROP COLUMN "strays",
ADD COLUMN     "chest" INTEGER,
ADD COLUMN     "guardian" TEXT,
ADD COLUMN     "puzzle" TEXT,
ADD COLUMN     "stray" TEXT;
