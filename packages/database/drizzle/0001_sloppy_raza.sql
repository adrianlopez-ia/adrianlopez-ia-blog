CREATE TABLE `padel_bot_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`target_hour` text DEFAULT '19:00' NOT NULL,
	`days_ahead` integer DEFAULT 5 NOT NULL,
	`with_light` integer DEFAULT true NOT NULL,
	`two_hours` integer DEFAULT true NOT NULL,
	`max_wait_minutes` integer DEFAULT 12 NOT NULL,
	`api_url` text DEFAULT '' NOT NULL,
	`headers` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
