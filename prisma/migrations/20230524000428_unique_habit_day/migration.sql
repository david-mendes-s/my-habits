/*
  Warnings:

  - A unique constraint covering the columns `[day_id,habit_id]` on the table `DayHabit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DayHabit_day_id_habit_id_key" ON "DayHabit"("day_id", "habit_id");
