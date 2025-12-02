CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`attempt_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`selected_option` text,
	`is_correct` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`topic_id` integer NOT NULL,
	`difficulty` text NOT NULL,
	`question_text` text NOT NULL,
	`option_a` text NOT NULL,
	`option_b` text NOT NULL,
	`option_c` text NOT NULL,
	`option_d` text NOT NULL,
	`correct_option` text NOT NULL,
	`explanation` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` integer,
	`score` integer DEFAULT 0 NOT NULL,
	`total_questions` integer NOT NULL,
	`started_at` text NOT NULL,
	`finished_at` text,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE TABLE `user_topics_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`topic_id` integer NOT NULL,
	`completion_percent` integer DEFAULT 0 NOT NULL,
	`sections_completed` text DEFAULT '[]' NOT NULL,
	`last_visited_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE no action
);
