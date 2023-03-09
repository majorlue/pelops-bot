/*
  Warnings:

  - The primary key for the `towers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `tower_year` to the `floors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `towers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "floors" DROP CONSTRAINT "floors_tower_theme_tower_week_fkey";

-- AlterTable
ALTER TABLE "floors" ADD COLUMN     "tower_year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "towers" DROP CONSTRAINT "towers_pkey",
ADD COLUMN     "year" INTEGER NOT NULL,
ADD CONSTRAINT "towers_pkey" PRIMARY KEY ("theme", "week", "year");

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_tower_theme_tower_week_tower_year_fkey" FOREIGN KEY ("tower_theme", "tower_week", "tower_year") REFERENCES "towers"("theme", "week", "year") ON DELETE RESTRICT ON UPDATE CASCADE;
