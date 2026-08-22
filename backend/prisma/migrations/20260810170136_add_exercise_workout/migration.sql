/*
  Warnings:

  - You are about to drop the column `finishedAt` on the `workoutsession` table. All the data in the column will be lost.
  - Added the required column `category` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `difficulty` on table `exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `instructions` on table `exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `workoutsession` DROP FOREIGN KEY `WorkoutSession_exerciseId_fkey`;

-- DropIndex
DROP INDEX `Exercise_name_key` ON `exercise`;

-- DropIndex
DROP INDEX `WorkoutSession_exerciseId_fkey` ON `workoutsession`;

-- AlterTable
ALTER TABLE `exercise` ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `description` TEXT NOT NULL,
    MODIFY `difficulty` VARCHAR(191) NOT NULL,
    MODIFY `instructions` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `workoutsession` DROP COLUMN `finishedAt`,
    ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `WorkoutSession` ADD CONSTRAINT `WorkoutSession_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
