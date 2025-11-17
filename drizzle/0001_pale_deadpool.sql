CREATE TABLE `articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`read_time` integer NOT NULL,
	`category` text NOT NULL,
	`author` text NOT NULL,
	`author_avatar` text,
	`views` integer DEFAULT 0 NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`thumbnail_url` text,
	`tags` text,
	`published_at` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `downloadable_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` text NOT NULL,
	`file_url` text NOT NULL,
	`downloads` integer DEFAULT 0 NOT NULL,
	`category` text NOT NULL,
	`tags` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `video_tutorials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`rating` real DEFAULT 0 NOT NULL,
	`category` text NOT NULL,
	`level` text NOT NULL,
	`thumbnail_url` text NOT NULL,
	`video_url` text NOT NULL,
	`author` text NOT NULL,
	`tags` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
