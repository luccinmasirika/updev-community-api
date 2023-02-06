-- AlterTable
ALTER TABLE `series` ADD COLUMN `fileId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `series` ADD CONSTRAINT `series_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `files`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
