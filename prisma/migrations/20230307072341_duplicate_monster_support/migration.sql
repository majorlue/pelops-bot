/*
  Warnings:

  - You are about to drop the column `encounterId` on the `Monster` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Monster" DROP CONSTRAINT "Monster_encounterId_fkey";

-- AlterTable
ALTER TABLE "Monster" DROP COLUMN "encounterId";

-- CreateTable
CREATE TABLE "MonsterCount" (
    "id" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "encounterId" INTEGER,
    "monsterName" TEXT NOT NULL,

    CONSTRAINT "MonsterCount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MonsterCount" ADD CONSTRAINT "MonsterCount_monsterName_fkey" FOREIGN KEY ("monsterName") REFERENCES "Monster"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonsterCount" ADD CONSTRAINT "MonsterCount_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
