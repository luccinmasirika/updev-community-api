-- AlterTable
ALTER TABLE `comments` ADD COLUMN `depth` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `parentCommentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `flollowTagsId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `flollow-tags` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `flollow-tags_userId_idx`(`userId`),
    UNIQUE INDEX `flollow-tags_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `posts_slug_idx` ON `posts`(`slug`);

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flollow-tags` ADD CONSTRAINT `flollow-tags_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tags_flollowTagsId_fkey` FOREIGN KEY (`flollowTagsId`) REFERENCES `flollow-tags`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
