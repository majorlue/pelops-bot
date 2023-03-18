-- CreateTable
CREATE TABLE "persistent_messages" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persistent_messages_pkey" PRIMARY KEY ("id")
);
