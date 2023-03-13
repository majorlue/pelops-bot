/*
  Warnings:

  - You are about to drop the column `user_tag` on the `floor_submissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "floor_submissions" DROP COLUMN "user_tag",
ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;
