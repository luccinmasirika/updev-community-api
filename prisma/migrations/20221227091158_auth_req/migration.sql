/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `author-requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `author-requests_userId_key` ON `author-requests`(`userId`);
