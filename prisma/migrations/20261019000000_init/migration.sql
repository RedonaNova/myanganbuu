-- CreateTable
CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(64) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AdminUser_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` CHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Session_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimit` (
    `key` VARCHAR(191) NOT NULL,
    `count` INTEGER NOT NULL,
    `windowStart` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `room` ENUM('KITCHEN', 'BATHROOM', 'LIVING', 'BEDROOM', 'FACADE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `district` VARCHAR(64) NOT NULL DEFAULT '',
    `areaM2` DECIMAL(8, 1) NULL,
    `durationDays` INTEGER NULL,
    `completedAt` DATE NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `isSample` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `coverPhotoId` INTEGER NULL,
    `heroPairId` INTEGER NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    UNIQUE INDEX `Project_coverPhotoId_key`(`coverPhotoId`),
    UNIQUE INDEX `Project_heroPairId_key`(`heroPairId`),
    INDEX `Project_published_featured_idx`(`published`, `featured`),
    INDEX `Project_published_room_idx`(`published`, `room`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectService` (
    `projectId` INTEGER NOT NULL,
    `serviceSlug` VARCHAR(32) NOT NULL,

    INDEX `ProjectService_serviceSlug_idx`(`serviceSlug`),
    PRIMARY KEY (`projectId`, `serviceSlug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Photo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `role` ENUM('BEFORE', 'AFTER', 'GALLERY', 'PROGRESS') NOT NULL DEFAULT 'GALLERY',
    `alt` VARCHAR(255) NOT NULL DEFAULT '',
    `caption` VARCHAR(255) NOT NULL DEFAULT '',
    `milestoneDate` DATE NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `storageKey` VARCHAR(64) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `lqip` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pairedAfterId` INTEGER NULL,

    UNIQUE INDEX `Photo_storageKey_key`(`storageKey`),
    UNIQUE INDEX `Photo_pairedAfterId_key`(`pairedAfterId`),
    INDEX `Photo_projectId_sortOrder_idx`(`projectId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(32) NOT NULL,
    `unitPrice` INTEGER NOT NULL DEFAULT 0,
    `category` VARCHAR(64) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `publicToken` VARCHAR(32) NOT NULL,
    `clientName` VARCHAR(191) NOT NULL DEFAULT '',
    `address` VARCHAR(255) NOT NULL DEFAULT '',
    `note` TEXT NOT NULL,
    `includesMaterials` BOOLEAN NOT NULL DEFAULT false,
    `validUntil` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `inquiryId` INTEGER NULL,

    UNIQUE INDEX `Quote_publicToken_key`(`publicToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuoteLine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quoteId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(32) NOT NULL,
    `unitPrice` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `QuoteLine_quoteId_idx`(`quoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inquiry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serviceSlug` VARCHAR(32) NOT NULL DEFAULT '',
    `room` ENUM('KITCHEN', 'BATHROOM', 'LIVING', 'BEDROOM', 'FACADE', 'OTHER') NULL,
    `areaM2` DECIMAL(8, 1) NULL,
    `district` VARCHAR(64) NOT NULL DEFAULT '',
    `message` TEXT NOT NULL,
    `timing` VARCHAR(32) NOT NULL DEFAULT '',
    `contactMethod` ENUM('MESSENGER', 'SMS') NOT NULL,
    `contactValue` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('NEW', 'CONTACTED', 'QUOTED', 'STARTED', 'DONE') NOT NULL DEFAULT 'NEW',
    `adminNote` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Inquiry_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InquiryPhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inquiryId` INTEGER NOT NULL,
    `storageKey` VARCHAR(64) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `lqip` TEXT NOT NULL,

    UNIQUE INDEX `InquiryPhoto_storageKey_key`(`storageKey`),
    INDEX `InquiryPhoto_inquiryId_idx`(`inquiryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `endpoint` VARCHAR(512) NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PushSubscription_endpoint_key`(`endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(64) NOT NULL,
    `value` TEXT NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_coverPhotoId_fkey` FOREIGN KEY (`coverPhotoId`) REFERENCES `Photo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_heroPairId_fkey` FOREIGN KEY (`heroPairId`) REFERENCES `Photo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectService` ADD CONSTRAINT `ProjectService_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Photo` ADD CONSTRAINT `Photo_pairedAfterId_fkey` FOREIGN KEY (`pairedAfterId`) REFERENCES `Photo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_inquiryId_fkey` FOREIGN KEY (`inquiryId`) REFERENCES `Inquiry`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteLine` ADD CONSTRAINT `QuoteLine_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `Quote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InquiryPhoto` ADD CONSTRAINT `InquiryPhoto_inquiryId_fkey` FOREIGN KEY (`inquiryId`) REFERENCES `Inquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

