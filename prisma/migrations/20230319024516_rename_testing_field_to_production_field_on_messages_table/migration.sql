/*
  Warnings:

  - You are about to drop the column `testing` on the `persistent_messages` table. All the data in the column will be lost.
  - Added the required column `production` to the `persistent_messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "persistent_messages" 
RENAME COLUMN "testing" TO "production";
