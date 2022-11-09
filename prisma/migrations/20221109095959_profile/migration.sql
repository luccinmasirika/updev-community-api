-- DropForeignKey
ALTER TABLE `profiles` DROP FOREIGN KEY `profiles_phoneId_fkey`;

-- AlterTable
ALTER TABLE `profiles` MODIFY `country` VARCHAR(191) NULL,
    MODIFY `town` VARCHAR(191) NULL,
    MODIFY `phoneId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `Phone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
