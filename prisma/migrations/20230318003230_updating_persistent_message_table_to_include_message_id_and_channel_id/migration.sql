/*
  Warnings:

  - Added the required column `channel_id` to the `persistent_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_id` to the `persistent_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "persistent_messages" ADD COLUMN     "channel_id" TEXT NOT NULL,
ADD COLUMN     "message_id" TEXT NOT NULL;
