/*
  Warnings:

  - You are about to drop the column `name` on the `flollow-tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,tagName]` on the table `flollow-tags` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tagName` to the `flollow-tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `flollow-tags` DROP FOREIGN KEY `flollow-tags_name_fkey`;

-- DropIndex
DROP INDEX `flollow-tags_userId_name_key` ON `flollow-tags`;

-- AlterTable
ALTER TABLE `flollow-tags` DROP COLUMN `name`,
    ADD COLUMN `tagName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `flollow-tags_userId_tagName_key` ON `flollow-tags`(`userId`, `tagName`);

-- AddForeignKey
ALTER TABLE `flollow-tags` ADD CONSTRAINT `flollow-tags_tagName_fkey` FOREIGN KEY (`tagName`) REFERENCES `tags`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;
