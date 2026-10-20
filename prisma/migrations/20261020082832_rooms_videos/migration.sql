-- CreateTable
CREATE TABLE `ProjectRoom` (
    `projectId` INTEGER NOT NULL,
    `room` ENUM('KITCHEN', 'BATHROOM', 'LIVING', 'BEDROOM', 'FACADE', 'OTHER') NOT NULL,

    INDEX `ProjectRoom_room_idx`(`room`),
    PRIMARY KEY (`projectId`, `room`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `storageKey` VARCHAR(64) NOT NULL,
    `mime` VARCHAR(64) NOT NULL,
    `ext` VARCHAR(8) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NOT NULL DEFAULT 0,
    `height` INTEGER NOT NULL DEFAULT 0,
    `durationSec` INTEGER NOT NULL DEFAULT 0,
    `posterKey` VARCHAR(64) NULL,
    `posterLqip` TEXT NULL,
    `caption` VARCHAR(255) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Video_storageKey_key`(`storageKey`),
    UNIQUE INDEX `Video_posterKey_key`(`posterKey`),
    INDEX `Video_projectId_sortOrder_idx`(`projectId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectRoom` ADD CONSTRAINT `ProjectRoom_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Video` ADD CONSTRAINT `Video_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


-- Carry each work's single room over to the new many-rooms table.
INSERT INTO `ProjectRoom` (`projectId`, `room`) SELECT `id`, `room` FROM `Project`;
