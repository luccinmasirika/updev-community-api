/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `post-bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `post-bookmarks_postId_userId_key` ON `post-bookmarks`(`postId`, `userId`);
