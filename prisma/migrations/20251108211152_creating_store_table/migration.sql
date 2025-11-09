-- CreateTable
CREATE TABLE `Store` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `logo` VARCHAR(191) NOT NULL,
    `cover` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'BANNED', 'DISABLED') NOT NULL DEFAULT 'PENDING',
    `averageRating` DOUBLE NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `returnPolicy` VARCHAR(191) NULL,
    `defaultShippingService` VARCHAR(191) NULL,
    `defaultShippingFees` DOUBLE NULL,
    `defaultDeliveryTimeMin` INTEGER NULL,
    `defaultDeliveryTimeMax` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Store_email_key`(`email`),
    UNIQUE INDEX `Store_url_key`(`url`),
    INDEX `Store_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
