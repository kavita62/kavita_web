CREATE TABLE `projectFrames` (
  `id` varchar(128) NOT NULL,
  `projectId` varchar(128) NOT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `mediaType` varchar(16) NOT NULL,
  `src` text NOT NULL,
  `caption` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `layout` varchar(32) NOT NULL DEFAULT 'wide',
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `projectFrames_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `reelVideoUrls` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `flowVideoUrls` text NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `template` varchar(40) DEFAULT 'cinematic' NOT NULL;
--> statement-breakpoint
UPDATE `homepageSettings` SET `reelVideoUrls`='["https://cdn.pixabay.com/video/2020/05/28/40390-425442522_medium.mp4","https://cdn.pixabay.com/video/2025/11/17/316579_medium.mp4","https://cdn.pixabay.com/video/2021/05/28/75547-556034400_medium.mp4"]', `flowVideoUrls`='["https://cdn.pixabay.com/video/2026/07/08/362758_medium.mp4","https://cdn.pixabay.com/video/2017/11/26/13071-244835811_medium.mp4","https://cdn.pixabay.com/video/2020/03/11/33517-397143847_medium.mp4"]' WHERE `id`=1;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `reelVideoUrls` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `flowVideoUrls` text NOT NULL;
