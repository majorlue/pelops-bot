/*
  Warnings:

  - Added the required column `leaderName` to the `Encounter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Encounter" ADD COLUMN     "leaderName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_leaderName_fkey" FOREIGN KEY ("leaderName") REFERENCES "Monster"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
