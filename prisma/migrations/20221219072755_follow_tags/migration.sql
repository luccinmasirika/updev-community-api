/*
  Warnings:

  - You are about to drop the column `flollowTagsId` on the `tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tags` DROP FOREIGN KEY `tags_flollowTagsId_fkey`;

-- AlterTable
ALTER TABLE `tags` DROP COLUMN `flollowTagsId`,
    ADD COLUMN `followersId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tags_followersId_fkey` FOREIGN KEY (`followersId`) REFERENCES `flollow-tags`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
