/*
  Warnings:

  - The primary key for the `floors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `floors` table. All the data in the column will be lost.
  - Changed the type of `chests` on the `floors` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "floors" DROP CONSTRAINT "floors_pkey",
DROP COLUMN "id",
DROP COLUMN "chests",
ADD COLUMN     "chests" INTEGER NOT NULL,
ADD CONSTRAINT "floors_pkey" PRIMARY KEY ("tower_theme", "tower_week");
