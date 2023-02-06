/*
  Warnings:

  - Added the required column `duration` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `survey` ADD COLUMN `duration` INTEGER NOT NULL;
