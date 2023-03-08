/*
  Warnings:

  - The primary key for the `monsters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `mounster_counts` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[leader]` on the table `encounters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,berserk,statuses]` on the table `monsters` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "encounters" DROP CONSTRAINT "encounters_leader_fkey";

-- DropForeignKey
ALTER TABLE "mounster_counts" DROP CONSTRAINT "mounster_counts_encounter_leader_fkey";

-- DropForeignKey
ALTER TABLE "mounster_counts" DROP CONSTRAINT "mounster_counts_monsterName_fkey";

-- AlterTable
ALTER TABLE "monsters" DROP CONSTRAINT "monsters_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "monsters_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "mounster_counts";

-- CreateTable
CREATE TABLE "_EncounterToMonster" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_EncounterToMonster_AB_unique" ON "_EncounterToMonster"("A", "B");

-- CreateIndex
CREATE INDEX "_EncounterToMonster_B_index" ON "_EncounterToMonster"("B");

-- CreateIndex
CREATE UNIQUE INDEX "encounters_leader_key" ON "encounters"("leader");

-- CreateIndex
CREATE UNIQUE INDEX "monsters_name_berserk_statuses_key" ON "monsters"("name", "berserk", "statuses");

-- AddForeignKey
ALTER TABLE "_EncounterToMonster" ADD CONSTRAINT "_EncounterToMonster_A_fkey" FOREIGN KEY ("A") REFERENCES "encounters"("leader") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EncounterToMonster" ADD CONSTRAINT "_EncounterToMonster_B_fkey" FOREIGN KEY ("B") REFERENCES "monsters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
