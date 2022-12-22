/*
  Warnings:

  - You are about to drop the `flollow-tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `flollow-tags` DROP FOREIGN KEY `flollow-tags_tagName_fkey`;

-- DropForeignKey
ALTER TABLE `flollow-tags` DROP FOREIGN KEY `flollow-tags_userId_fkey`;

-- DropTable
DROP TABLE `flollow-tags`;

-- CreateTable
CREATE TABLE `follow-tags` (
    `id` VARCHAR(191) NOT NULL,
    `tagName` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `follow-tags_userId_idx`(`userId`),
    UNIQUE INDEX `follow-tags_userId_tagName_key`(`userId`, `tagName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `follow-tags` ADD CONSTRAINT `follow-tags_tagName_fkey` FOREIGN KEY (`tagName`) REFERENCES `tags`(`name`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follow-tags` ADD CONSTRAINT `follow-tags_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
