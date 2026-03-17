-- Manual DDL for production (spring.jpa.hibernate.ddl-auto=validate)
-- Run after backup and verify existing constraints/index names in your DB.

ALTER TABLE `image`
    DROP COLUMN IF EXISTS `post_id`;

ALTER TABLE `post`
    DROP COLUMN IF EXISTS `thumbnail_image_id`;

ALTER TABLE `image`
    ADD COLUMN IF NOT EXISTS `temp_key` VARCHAR(100) NULL,
    ADD COLUMN IF NOT EXISTS `temporary` BIT(1) NOT NULL DEFAULT b'1',
    ADD COLUMN IF NOT EXISTS `uploaded_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN IF NOT EXISTS `extension` VARCHAR(20) NULL,
    ADD COLUMN IF NOT EXISTS `mime_type` VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS `file_size` BIGINT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `post_image` (
    `post_image_id` BIGINT NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT NOT NULL,
    `image_id` BIGINT NOT NULL,
    `usage_type` VARCHAR(20) NOT NULL,
    `sort_order` INT NOT NULL,
    PRIMARY KEY (`post_image_id`)
);

CREATE INDEX IF NOT EXISTS `idx_image_temp_user` ON `image` (`user_id`, `temp_key`);
CREATE INDEX IF NOT EXISTS `idx_post_image_post_usage` ON `post_image` (`post_id`, `usage_type`, `sort_order`);
CREATE INDEX IF NOT EXISTS `idx_post_image_image` ON `post_image` (`image_id`);

ALTER TABLE `post_image`
    ADD CONSTRAINT `fk_post_image_post`
        FOREIGN KEY (`post_id`) REFERENCES `post` (`post_id`);

ALTER TABLE `post_image`
    ADD CONSTRAINT `fk_post_image_image`
        FOREIGN KEY (`image_id`) REFERENCES `image` (`image_id`);
