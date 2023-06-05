/*
  Warnings:

  - Added the required column `week_day` to the `DayHabit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DayHabit" ADD COLUMN     "week_day" INTEGER NOT NULL;
