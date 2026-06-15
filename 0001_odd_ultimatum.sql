CREATE TABLE `order_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `order_categories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `order_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`provider` varchar(255),
	`code` varchar(100),
	`link` text,
	`quantity` int NOT NULL,
	`urgency` enum('Alta','Media','Baja') NOT NULL DEFAULT 'Media',
	`photoUrl` varchar(500),
	`photoKey` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_subcategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`categoryId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_subcategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`subcategoryId` int,
	`status` enum('draft','submitted','in_progress','completed','cancelled') NOT NULL DEFAULT 'submitted',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
