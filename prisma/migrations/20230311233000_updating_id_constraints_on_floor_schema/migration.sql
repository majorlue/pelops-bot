/*
  Warnings:

  - The primary key for the `floors` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `number` on the `floors` table. All the data in the column will be lost.
  - Added the required column `tower_floor` to the `floors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "floors" DROP CONSTRAINT "floors_pkey",
DROP COLUMN "number",
ADD COLUMN     "tower_floor" INTEGER NOT NULL,
ADD CONSTRAINT "floors_pkey" PRIMARY KEY ("tower_theme", "tower_week", "tower_floor");
