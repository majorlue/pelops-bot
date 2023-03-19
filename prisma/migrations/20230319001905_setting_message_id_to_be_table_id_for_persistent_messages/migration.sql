/*
  Warnings:

  - The primary key for the `persistent_messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `persistent_messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "persistent_messages" DROP CONSTRAINT "persistent_messages_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "persistent_messages_pkey" PRIMARY KEY ("message_id");
