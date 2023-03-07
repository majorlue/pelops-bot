/*
  Warnings:

  - You are about to drop the `Encounter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Floor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Monster` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonsterCount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tower` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Encounter" DROP CONSTRAINT "Encounter_leader_fkey";

-- DropForeignKey
ALTER TABLE "Floor" DROP CONSTRAINT "Floor_towerTheme_towerWeek_fkey";

-- DropForeignKey
ALTER TABLE "MonsterCount" DROP CONSTRAINT "MonsterCount_encounterLeader_fkey";

-- DropForeignKey
ALTER TABLE "MonsterCount" DROP CONSTRAINT "MonsterCount_monsterName_fkey";

-- DropTable
DROP TABLE "Encounter";

-- DropTable
DROP TABLE "Floor";

-- DropTable
DROP TABLE "Monster";

-- DropTable
DROP TABLE "MonsterCount";

-- DropTable
DROP TABLE "Tower";

-- CreateTable
CREATE TABLE "towers" (
    "theme" TEXT NOT NULL,
    "week" INTEGER NOT NULL,

    CONSTRAINT "towers_pkey" PRIMARY KEY ("theme","week")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "guardians" TEXT[],
    "strays" TEXT[],
    "puzzles" TEXT[],
    "chests" TEXT[],
    "tower_theme" TEXT NOT NULL,
    "tower_week" INTEGER NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "leader" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("leader")
);

-- CreateTable
CREATE TABLE "mounster_counts" (
    "id" TEXT NOT NULL,
    "monsterName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "encounter_leader" TEXT,

    CONSTRAINT "mounster_counts_pkey" PRIMARY KEY ("monsterName","count")
);

-- CreateTable
CREATE TABLE "monsters" (
    "name" TEXT NOT NULL,
    "berserk" BOOLEAN NOT NULL DEFAULT false,
    "statuses" TEXT[],

    CONSTRAINT "monsters_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_tower_theme_tower_week_fkey" FOREIGN KEY ("tower_theme", "tower_week") REFERENCES "towers"("theme", "week") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_leader_fkey" FOREIGN KEY ("leader") REFERENCES "monsters"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mounster_counts" ADD CONSTRAINT "mounster_counts_monsterName_fkey" FOREIGN KEY ("monsterName") REFERENCES "monsters"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mounster_counts" ADD CONSTRAINT "mounster_counts_encounter_leader_fkey" FOREIGN KEY ("encounter_leader") REFERENCES "encounters"("leader") ON DELETE SET NULL ON UPDATE CASCADE;
