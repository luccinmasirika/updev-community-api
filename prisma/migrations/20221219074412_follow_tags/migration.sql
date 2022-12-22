/*
  Warnings:

  - You are about to drop the column `followersId` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `flollow-tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `flollow-tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `flollow-tags` DROP FOREIGN KEY `flollow-tags_userId_fkey`;

-- DropForeignKey
ALTER TABLE `tags` DROP FOREIGN KEY `tags_followersId_fkey`;

-- AlterTable
ALTER TABLE `flollow-tags` ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tags` DROP COLUMN `followersId`;

-- CreateIndex
CREATE UNIQUE INDEX `flollow-tags_userId_name_key` ON `flollow-tags`(`userId`, `name`);

-- AddForeignKey
ALTER TABLE `flollow-tags` ADD CONSTRAINT `flollow-tags_name_fkey` FOREIGN KEY (`name`) REFERENCES `tags`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flollow-tags` ADD CONSTRAINT `flollow-tags_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
