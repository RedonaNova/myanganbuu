-- CreateTable
CREATE TABLE `SitePhoto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `storageKey` VARCHAR(64) NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,
    `lqip` TEXT NOT NULL,
    `alt` VARCHAR(255) NOT NULL DEFAULT '',
    `caption` VARCHAR(255) NOT NULL DEFAULT '',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SitePhoto_storageKey_key`(`storageKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Services regrouped around his actual trades. Old slug -> new slug:
--   plumbing, tiling   -> bathroom
--   panels             -> tv-wall
--   drywall, flooring  -> renovation
UPDATE IGNORE `ProjectService` SET `serviceSlug` = 'bathroom' WHERE `serviceSlug` IN ('plumbing', 'tiling');
UPDATE IGNORE `ProjectService` SET `serviceSlug` = 'tv-wall' WHERE `serviceSlug` = 'panels';
UPDATE IGNORE `ProjectService` SET `serviceSlug` = 'renovation' WHERE `serviceSlug` IN ('drywall', 'flooring');
-- Rows left behind were duplicates of an already-mapped slug.
DELETE FROM `ProjectService` WHERE `serviceSlug` IN ('plumbing', 'tiling', 'panels', 'drywall', 'flooring');
UPDATE `Inquiry` SET `serviceSlug` = 'bathroom' WHERE `serviceSlug` IN ('plumbing', 'tiling');
UPDATE `Inquiry` SET `serviceSlug` = 'tv-wall' WHERE `serviceSlug` = 'panels';
UPDATE `Inquiry` SET `serviceSlug` = 'renovation' WHERE `serviceSlug` IN ('drywall', 'flooring');
