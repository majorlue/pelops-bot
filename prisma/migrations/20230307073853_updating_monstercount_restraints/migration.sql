/*
  Warnings:

  - The primary key for the `MonsterCount` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MonsterCount" DROP CONSTRAINT "MonsterCount_pkey",
ADD CONSTRAINT "MonsterCount_pkey" PRIMARY KEY ("monsterName", "count");
