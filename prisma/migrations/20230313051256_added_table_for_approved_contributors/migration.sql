-- CreateTable
CREATE TABLE "contributors" (
    "id" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contributors_pkey" PRIMARY KEY ("id")
);
