/*
  Warnings:

  - The primary key for the `Encounter` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `leaderName` on the `Encounter` table. All the data in the column will be lost.
  - You are about to drop the column `encounterLeaderName` on the `MonsterCount` table. All the data in the column will be lost.
  - Added the required column `leader` to the `Encounter` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Encounter" DROP CONSTRAINT "Encounter_leaderName_fkey";

-- DropForeignKey
ALTER TABLE "MonsterCount" DROP CONSTRAINT "MonsterCount_encounterLeaderName_fkey";

-- AlterTable
ALTER TABLE "Encounter" DROP CONSTRAINT "Encounter_pkey",
DROP COLUMN "leaderName",
ADD COLUMN     "leader" TEXT NOT NULL,
ADD CONSTRAINT "Encounter_pkey" PRIMARY KEY ("leader");

-- AlterTable
ALTER TABLE "MonsterCount" DROP COLUMN "encounterLeaderName",
ADD COLUMN     "encounterLeader" TEXT;

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_leader_fkey" FOREIGN KEY ("leader") REFERENCES "Monster"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterCount" ADD CONSTRAINT "MonsterCount_encounterLeader_fkey" FOREIGN KEY ("encounterLeader") REFERENCES "Encounter"("leader") ON DELETE SET NULL ON UPDATE CASCADE;
