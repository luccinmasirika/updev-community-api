/*
  Warnings:

  - You are about to drop the column `fileId` on the `events` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `events` DROP FOREIGN KEY `events_fileId_fkey`;

-- AlterTable
ALTER TABLE `events` DROP COLUMN `fileId`,
    ADD COLUMN `link` VARCHAR(191) NULL;
