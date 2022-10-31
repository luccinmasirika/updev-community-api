/*
  Warnings:

  - A unique constraint covering the columns `[articleId,userId]` on the table `article-reactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[questionId,userId]` on the table `question-reactions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `article-reactions_articleId_userId_key` ON `article-reactions`(`articleId`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `question-reactions_questionId_userId_key` ON `question-reactions`(`questionId`, `userId`);
