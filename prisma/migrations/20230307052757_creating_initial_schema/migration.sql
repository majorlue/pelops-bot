-- CreateTable
CREATE TABLE "Tower" (
    "theme" TEXT NOT NULL,
    "week" INTEGER NOT NULL,

    CONSTRAINT "Tower_pkey" PRIMARY KEY ("theme","week")
);

-- CreateTable
CREATE TABLE "Floor" (
    "number" INTEGER NOT NULL,
    "guardians" TEXT[],
    "strays" TEXT[],
    "puzzles" TEXT[],
    "chests" TEXT[],
    "towerTheme" TEXT NOT NULL,
    "towerWeek" INTEGER NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" SERIAL NOT NULL,
    "tier" INTEGER NOT NULL,

    CONSTRAINT "Encounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monster" (
    "name" TEXT NOT NULL,
    "berserk" BOOLEAN NOT NULL,
    "statuses" TEXT[],
    "encounterId" INTEGER,

    CONSTRAINT "Monster_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_towerTheme_towerWeek_fkey" FOREIGN KEY ("towerTheme", "towerWeek") REFERENCES "Tower"("theme", "week") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Monster" ADD CONSTRAINT "Monster_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "Encounter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
