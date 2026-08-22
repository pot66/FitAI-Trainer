/*
  Warnings:

  - Added the required column `bmiStatus` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Made the column `age` on table `profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `height` on table `profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weight` on table `profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bmi` on table `profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `profile` ADD COLUMN `bmiStatus` VARCHAR(191) NOT NULL,
    MODIFY `age` INTEGER NOT NULL,
    MODIFY `height` DOUBLE NOT NULL,
    MODIFY `weight` DOUBLE NOT NULL,
    MODIFY `bmi` DOUBLE NOT NULL;
