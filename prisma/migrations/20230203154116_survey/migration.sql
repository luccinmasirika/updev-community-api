/*
  Warnings:

  - You are about to drop the column `text` on the `surveyoption` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `SurveyOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `survey` ADD COLUMN `questionId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `surveyoption` DROP COLUMN `text`,
    ADD COLUMN `content` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `SurveyQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `content` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Survey` ADD CONSTRAINT `Survey_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `SurveyQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
