ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_user_id_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `sessions` MODIFY COLUMN `user_id` bigint unsigned NOT NULL;
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
