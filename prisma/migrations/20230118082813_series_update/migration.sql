/*
  Warnings:

  - You are about to drop the column `description` on the `series` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `series` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `series` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `series` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `series` DROP FOREIGN KEY `series_fileId_fkey`;

-- DropIndex
DROP INDEX `series_slug_idx` ON `series`;

-- DropIndex
DROP INDEX `series_slug_key` ON `series`;

-- AlterTable
ALTER TABLE `series` DROP COLUMN `description`,
    DROP COLUMN `fileId`,
    DROP COLUMN `slug`,
    DROP COLUMN `title`;
