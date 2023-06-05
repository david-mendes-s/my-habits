-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progress_habit" INTEGER NOT NULL,
    "week_day" INTEGER NOT NULL,
    "date_completed_habit" TEXT NOT NULL,
    "possibleHabitsDay" INTEGER NOT NULL,
    "habitsCompleteds" INTEGER NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
