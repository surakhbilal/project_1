-- Tambah kolom nullable dulu agar aman untuk tabel yang sudah berisi data,
-- lalu backfill dan jadikan NOT NULL. User lama harus reset password.
ALTER TABLE `users` ADD `password` varchar(255);
--> statement-breakpoint
UPDATE `users` SET `password` = '' WHERE `password` IS NULL;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `password` varchar(255) NOT NULL;
