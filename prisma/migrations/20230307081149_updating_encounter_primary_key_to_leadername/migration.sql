/*
  Warnings:

  - The primary key for the `Encounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Encounter` table. All the data in the column will be lost.
  - You are about to drop the column `encounterId` on the `MonsterCount` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MonsterCount" DROP CONSTRAINT "MonsterCount_encounterId_fkey";

-- AlterTable
ALTER TABLE "Encounter" DROP CONSTRAINT "Encounter_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Encounter_pkey" PRIMARY KEY ("leaderName");

-- AlterTable
ALTER TABLE "MonsterCount" DROP COLUMN "encounterId",
ADD COLUMN     "encounterLeaderName" TEXT;

-- AddForeignKey
ALTER TABLE "MonsterCount" ADD CONSTRAINT "MonsterCount_encounterLeaderName_fkey" FOREIGN KEY ("encounterLeaderName") REFERENCES "Encounter"("leaderName") ON DELETE SET NULL ON UPDATE CASCADE;
