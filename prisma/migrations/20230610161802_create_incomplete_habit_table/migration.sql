-- CreateTable
CREATE TABLE "IncompleteHabit" (
    "id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date_created_at" TIMESTAMP(3) NOT NULL,
    "date_incomplete" TEXT NOT NULL,

    CONSTRAINT "IncompleteHabit_pkey" PRIMARY KEY ("id")
);
