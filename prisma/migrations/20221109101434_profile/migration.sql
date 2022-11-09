/*
  Warnings:

  - You are about to drop the column `phoneId` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the `Phone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `job` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `profiles` DROP FOREIGN KEY `profiles_phoneId_fkey`;

-- AlterTable
ALTER TABLE `profiles` DROP COLUMN `phoneId`,
    ADD COLUMN `job` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `Phone`;
