CREATE TABLE `homepageSettings` (
	`id` int NOT NULL,
	`backgroundVideo` text NOT NULL,
	`featuredProjectId` varchar(128) NOT NULL,
	`reelProjectIds` text NOT NULL,
	`flowProjectIds` text NOT NULL,
	`slideKicker` varchar(120) NOT NULL,
	`slideItems` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(128) NOT NULL,
	`index` varchar(8) NOT NULL,
	`label` varchar(80) NOT NULL,
	`title` varchar(255) NOT NULL,
	`tag` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`role` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`year` varchar(12) NOT NULL,
	`duration` int,
	`video` text NOT NULL,
	`pageURL` text,
	`featured` int NOT NULL DEFAULT 0,
	`published` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
