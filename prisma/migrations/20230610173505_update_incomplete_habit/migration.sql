/*
  Warnings:

  - A unique constraint covering the columns `[habit_id,date_incomplete]` on the table `IncompleteHabit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "IncompleteHabit_habit_id_date_incomplete_key" ON "IncompleteHabit"("habit_id", "date_incomplete");
