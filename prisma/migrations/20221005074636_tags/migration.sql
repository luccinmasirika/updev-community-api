/*
  Warnings:

  - You are about to drop the `posttags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `posttags` DROP FOREIGN KEY `PostTags_postId_fkey`;

-- DropForeignKey
ALTER TABLE `posttags` DROP FOREIGN KEY `PostTags_tagId_fkey`;

-- DropTable
DROP TABLE `posttags`;

-- CreateTable
CREATE TABLE `posts-tags` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `tagId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts-tags` ADD CONSTRAINT `posts-tags_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts-tags` ADD CONSTRAINT `posts-tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
