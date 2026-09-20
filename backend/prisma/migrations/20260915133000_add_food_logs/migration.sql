-- CreateTable
CREATE TABLE IF NOT EXISTS `foodlog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `mealType` VARCHAR(191) NOT NULL,
    `imageUrl` TEXT NULL,
    `note` VARCHAR(191) NULL,
    `totalCalories` DOUBLE NOT NULL DEFAULT 0,
    `totalProtein` DOUBLE NOT NULL DEFAULT 0,
    `totalCarbs` DOUBLE NOT NULL DEFAULT 0,
    `totalFat` DOUBLE NOT NULL DEFAULT 0,
    `loggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `foodlog_userId_idx`(`userId`),
    INDEX `foodlog_loggedAt_idx`(`loggedAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `foodlog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `fooditem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `foodLogId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 1,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'serving',
    `calories` DOUBLE NOT NULL DEFAULT 0,
    `protein` DOUBLE NOT NULL DEFAULT 0,
    `carbs` DOUBLE NOT NULL DEFAULT 0,
    `fat` DOUBLE NOT NULL DEFAULT 0,
    `confidence` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `fooditem_foodLogId_idx`(`foodLogId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `fooditem_foodLogId_fkey` FOREIGN KEY (`foodLogId`) REFERENCES `foodlog`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;