/*
  Warnings:

  - Added the required column `module` to the `series-posts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `series-posts` ADD COLUMN `module` INTEGER NOT NULL;
