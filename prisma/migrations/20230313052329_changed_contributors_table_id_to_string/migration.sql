/*
  Warnings:

  - The primary key for the `contributors` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "contributors" DROP CONSTRAINT "contributors_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "contributors_pkey" PRIMARY KEY ("id");
