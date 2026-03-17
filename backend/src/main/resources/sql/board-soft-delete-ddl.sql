-- Manual DDL for production (spring.jpa.hibernate.ddl-auto=validate)
-- Run after backup and verify existing constraints/index names in your DB.

ALTER TABLE `board`
    ADD COLUMN IF NOT EXISTS `deleted` BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME(6) NULL;

ALTER TABLE `post`
    ADD COLUMN IF NOT EXISTS `deleted` BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME(6) NULL;

ALTER TABLE `reply`
    ADD COLUMN IF NOT EXISTS `deleted` BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS `deleted_at` DATETIME(6) NULL;

CREATE INDEX IF NOT EXISTS `idx_board_deleted_at` ON `board` (`deleted_at`);
CREATE INDEX IF NOT EXISTS `idx_post_deleted_at` ON `post` (`deleted_at`);
CREATE INDEX IF NOT EXISTS `idx_reply_deleted_at` ON `reply` (`deleted_at`);
