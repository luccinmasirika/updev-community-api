-- AlterTable
ALTER TABLE `articles` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `questions` ADD COLUMN `published` BOOLEAN NOT NULL DEFAULT true;
