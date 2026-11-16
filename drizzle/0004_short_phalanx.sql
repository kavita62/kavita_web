ALTER TABLE `homepageSettings` ADD `liveFrameBackgroundVideo` text NULL;
--> statement-breakpoint
UPDATE `homepageSettings` SET `liveFrameBackgroundVideo`=`backgroundVideo` WHERE `id`=1;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `liveFrameBackgroundVideo` text NOT NULL;
