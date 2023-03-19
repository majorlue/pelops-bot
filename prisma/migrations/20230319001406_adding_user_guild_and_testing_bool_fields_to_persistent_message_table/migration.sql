/*
  Warnings:

  - Added the required column `guild_id` to the `persistent_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `persistent_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "persistent_messages" ADD COLUMN     "guild_id" TEXT NOT NULL,
ADD COLUMN     "testing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_id" TEXT NOT NULL;
