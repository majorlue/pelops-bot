-- CreateTable
CREATE TABLE "floor_submissions" (
    "id" TEXT NOT NULL,
    "tower_theme" TEXT NOT NULL,
    "tower_week" TEXT NOT NULL,
    "tower_floor" INTEGER NOT NULL,
    "guardians" TEXT[],
    "strays" TEXT[],
    "puzzles" TEXT[],
    "chests" INTEGER,
    "user" TEXT NOT NULL,

    CONSTRAINT "floor_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "floor_submissions" ADD CONSTRAINT "floor_submissions_tower_theme_tower_week_fkey" FOREIGN KEY ("tower_theme", "tower_week") REFERENCES "towers"("theme", "week") ON DELETE RESTRICT ON UPDATE CASCADE;
