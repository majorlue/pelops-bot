-- AlterTable
ALTER TABLE "floor_submissions" ALTER COLUMN "approved" DROP NOT NULL,
ALTER COLUMN "approved" DROP DEFAULT;
