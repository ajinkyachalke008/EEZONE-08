CREATE TABLE `circuit_projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`description` text,
	`thumbnail` text,
	`components` text NOT NULL,
	`wires` text NOT NULL,
	`simulation_settings` text,
	`category` text NOT NULL,
	`is_template` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
