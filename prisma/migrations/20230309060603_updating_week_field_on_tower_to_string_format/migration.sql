/*
  Warnings:

  - You are about to drop the column `tower_year` on the `floors` table. All the data in the column will be lost.
  - The primary key for the `towers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `year` on the `towers` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "floors" DROP CONSTRAINT "floors_tower_theme_tower_week_tower_year_fkey";

-- AlterTable
ALTER TABLE "floors" DROP COLUMN "tower_year",
ALTER COLUMN "tower_week" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "towers" DROP CONSTRAINT "towers_pkey",
DROP COLUMN "year",
ALTER COLUMN "week" SET DATA TYPE TEXT,
ADD CONSTRAINT "towers_pkey" PRIMARY KEY ("theme", "week");

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_tower_theme_tower_week_fkey" FOREIGN KEY ("tower_theme", "tower_week") REFERENCES "towers"("theme", "week") ON DELETE RESTRICT ON UPDATE CASCADE;
