/*
  Warnings:

  - You are about to drop the column `reaction` on the `article-reactions` table. All the data in the column will be lost.
  - You are about to drop the column `reaction` on the `question-reactions` table. All the data in the column will be lost.
  - Added the required column `type` to the `article-reactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `question-reactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `article-reactions` DROP COLUMN `reaction`,
    ADD COLUMN `type` ENUM('LIKE', 'LOVE', 'USEFUL') NOT NULL;

-- AlterTable
ALTER TABLE `question-reactions` DROP COLUMN `reaction`,
    ADD COLUMN `type` ENUM('LIKE', 'DISLIKE') NOT NULL;
