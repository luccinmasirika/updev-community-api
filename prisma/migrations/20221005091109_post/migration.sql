-- AlterTable
ALTER TABLE `posts` ADD COLUMN `articleId` VARCHAR(191) NULL,
    ADD COLUMN `questionId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
