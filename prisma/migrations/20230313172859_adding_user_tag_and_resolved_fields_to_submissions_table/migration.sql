-- AlterTable
ALTER TABLE "floor_submissions" ADD COLUMN     "resolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user_tag" TEXT NOT NULL DEFAULT '';
