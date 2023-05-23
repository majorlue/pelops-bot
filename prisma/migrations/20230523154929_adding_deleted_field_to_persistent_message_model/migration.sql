-- AlterTable
ALTER TABLE "persistent_messages" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
