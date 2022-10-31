/*
  Warnings:

  - You are about to drop the column `bookmarks` on the `question-reactions` table. All the data in the column will be lost.
  - You are about to drop the column `dislikes` on the `question-reactions` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `question-reactions` table. All the data in the column will be lost.
  - You are about to drop the column `shares` on the `question-reactions` table. All the data in the column will be lost.
  - Added the required column `reaction` to the `question-reactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `question-reactions` DROP COLUMN `bookmarks`,
    DROP COLUMN `dislikes`,
    DROP COLUMN `likes`,
    DROP COLUMN `shares`,
    ADD COLUMN `reaction` ENUM('LIKE', 'DISLIKE') NOT NULL;
