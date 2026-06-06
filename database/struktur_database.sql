/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET FOREIGN_KEY_CHECKS=0 */;

CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `test`;

-- Table schema for: test.users
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_status` enum('ACTIVE','DELETED','SUSPENDED') NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `availability` varchar(100) DEFAULT NULL,
  `average_rating` double DEFAULT NULL,
  `bidang` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `business_website` varchar(200) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `deleted_at` datetime(6) DEFAULT NULL,
  `email` varchar(190) NOT NULL,
  `email_verified` bit(1) NOT NULL,
  `facebook_url` varchar(200) DEFAULT NULL,
  `github_url` varchar(200) DEFAULT NULL,
  `headline` varchar(150) DEFAULT NULL,
  `instagram_url` varchar(200) DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `linkedin_url` varchar(200) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `nama` varchar(150) NOT NULL,
  `password_hash` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `role` enum('ADMIN','MAHASISWA','UMKM') DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `total_reviews` int DEFAULT NULL,
  `university` varchar(200) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `years_experience` int DEFAULT NULL,
  `youtube_url` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;


-- Table schema for: test.announcements
CREATE TABLE `announcements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table schema for: test.projects
CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicant_count` int NOT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_url` varchar(1000) DEFAULT NULL,
  `brief_text` text DEFAULT NULL,
  `budget` decimal(38,2) NOT NULL,
  `category` varchar(255) NOT NULL,
  `complexity` enum('BEGINNER','EXPERT','INTERMEDIATE') DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `deadline` date NOT NULL,
  `description` text NOT NULL,
  `estimated_duration` varchar(50) DEFAULT NULL,
  `finished_at` datetime(6) DEFAULT NULL,
  `finished_by_umkm_id` bigint DEFAULT NULL,
  `finishing_link` varchar(255) DEFAULT NULL,
  `finishing_submitted_at` datetime(6) DEFAULT NULL,
  `required_skills` varchar(500) DEFAULT NULL,
  `status` enum('CLOSED','DONE','ONGOING','OPEN','OVERDUE') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `owner_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_project_status` (`status`),
  KEY `idx_project_owner` (`owner_id`),
  CONSTRAINT `FKmueqy6cpcwpfl8gnnag4idjt9` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;


-- Table schema for: test.activities
CREATE TABLE `activities` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) NOT NULL,
  `related_entity_id` bigint DEFAULT NULL,
  `related_entity_type` varchar(200) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `FKq6cjukylkgxdjkm9npk9va2f2` (`user_id`),
  CONSTRAINT `FKq6cjukylkgxdjkm9npk9va2f2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=150001;


-- Table schema for: test.email_verification_token
CREATE TABLE `email_verification_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `expiry_date` datetime(6) NOT NULL,
  `token` varchar(255) NOT NULL,
  `verified_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `UKidu2ippaks8bn6vcsq62khvdu` (`token`),
  UNIQUE KEY `UK1sxbwflvq4skafkocq315i9dt` (`user_id`),
  CONSTRAINT `FKknax5in7pcatm2uf9uyple35x` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=120001;


-- Table schema for: test.notifications
CREATE TABLE `notifications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `message` text NOT NULL,
  `is_read` bit(1) NOT NULL,
  `read_at` datetime(6) DEFAULT NULL,
  `related_entity_id` bigint DEFAULT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('ACCOUNT_UPDATE','APPLICATION_ACCEPTED','APPLICATION_RECEIVED','APPLICATION_REJECTED','NEW_MESSAGE','PROJECT_COMPLETED','PROJECT_DEADLINE_REMINDER','PROJECT_STARTED','REVIEW_RECEIVED','SYSTEM_ANNOUNCEMENT','WORK_ACCEPTED','WORK_REVISION_REQUESTED','WORK_SUBMITTED') NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_notification_user` (`user_id`),
  KEY `idx_notification_read` (`user_id`,`is_read`),
  KEY `idx_notification_created` (`created_at`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;


-- Table schema for: test.password_reset_token
CREATE TABLE `password_reset_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code_expiry_date` datetime(6) NOT NULL,
  `code_verified` bit(1) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry_date` datetime(6) DEFAULT NULL,
  `verification_code` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `UK77s7lgq1dxugyc665ft669b1r` (`reset_token`),
  UNIQUE KEY `UKdj5rd4h78vpwbkxwfdbjypwsq` (`verification_code`),
  UNIQUE KEY `UKf90ivichjaokvmovxpnlm5nin` (`user_id`),
  CONSTRAINT `FK83nsrttkwkb6ym0anu051mtxn` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


-- Table schema for: test.project_applications
CREATE TABLE `project_applications` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bid_amount` decimal(38,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `finishing_link` varchar(255) DEFAULT NULL,
  `finishing_submitted_at` datetime(6) DEFAULT NULL,
  `is_finished_by_student` bit(1) DEFAULT NULL,
  `proposal_text` text NOT NULL,
  `status` enum('APPROVED','PENDING','REJECTED') NOT NULL,
  `project_id` bigint NOT NULL,
  `applicant_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_project_applicant` (`project_id`,`applicant_id`),
  KEY `FK111460akuqw8e7tkulm4cidm0` (`applicant_id`),
  CONSTRAINT `FKc6jq10knr6gi8us7c7dvexjhd` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `FK111460akuqw8e7tkulm4cidm0` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;


-- Table schema for: test.contracts
CREATE TABLE `contracts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `project_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `umkm_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `UKnbv5jhiblw69121gnrnm8tgw9` (`project_id`),
  KEY `FK1afl7ooynx3cjlb8ninid2ipk` (`student_id`),
  KEY `FKqfif13fa3a34x8btijf3w36ot` (`umkm_id`),
  CONSTRAINT `FK8i3ky7vbbfg6r6tp7dqemne0a` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `FK1afl7ooynx3cjlb8ninid2ipk` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqfif13fa3a34x8btijf3w36ot` FOREIGN KEY (`umkm_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;


-- Table schema for: test.reviews
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `comment` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `project_id` bigint DEFAULT NULL,
  `reviewed_user_id` bigint DEFAULT NULL,
  `reviewer_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `FKardcqy60f05ca7v9eg3o1rn8p` (`project_id`),
  KEY `FK6m1kr6qopmdr9icvailpjx8xf` (`reviewed_user_id`),
  KEY `FKd1isgfajhtdl8mgg29up6mofi` (`reviewer_id`),
  CONSTRAINT `FKardcqy60f05ca7v9eg3o1rn8p` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `FK6m1kr6qopmdr9icvailpjx8xf` FOREIGN KEY (`reviewed_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKd1isgfajhtdl8mgg29up6mofi` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;


-- Table schema for: test.work_submissions
CREATE TABLE `work_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `links` text DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `submitted_at` datetime(6) NOT NULL,
  `project_id` bigint NOT NULL,
  `submitted_by_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `FKan9vpekl39c0hvvh9m0hernk7` (`project_id`),
  KEY `FKgpqf1hfdmi91wcav0eqdetijt` (`submitted_by_id`),
  CONSTRAINT `FKan9vpekl39c0hvvh9m0hernk7` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `FKgpqf1hfdmi91wcav0eqdetijt` FOREIGN KEY (`submitted_by_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;


-- Table schema for: test.uploaded_files
CREATE TABLE `uploaded_files` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content_type` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` bigint NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `project_id` bigint DEFAULT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `uploader_id` bigint NOT NULL,
  `submission_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `UKr28os8e3hr6ibcp9hdq8es2q` (`stored_filename`),
  KEY `FK49kn9b9a9w1a00gwep7hfnjcs` (`uploader_id`),
  KEY `FK2u6krj31duhb24qk63vqbxhve` (`submission_id`),
  CONSTRAINT `FK49kn9b9a9w1a00gwep7hfnjcs` FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK2u6krj31duhb24qk63vqbxhve` FOREIGN KEY (`submission_id`) REFERENCES `work_submissions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;


-- Table schema for: test.reports
CREATE TABLE `reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_notes` text DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` text NOT NULL,
  `evidence_filename` varchar(255) DEFAULT NULL,
  `evidence_url` varchar(1000) DEFAULT NULL,
  `handled_at` datetime(6) DEFAULT NULL,
  `status` enum('CLOSED','IN_REVIEW','PENDING','RESOLVED') NOT NULL,
  `subject` varchar(200) NOT NULL,
  `type` enum('BUG','CONTRACT_ISSUE','OTHER','PAYMENT_ISSUE','USER_COMPLAINT') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `handled_by_id` bigint DEFAULT NULL,
  `related_project_id` bigint DEFAULT NULL,
  `reported_user_id` bigint DEFAULT NULL,
  `reporter_id` bigint NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `FKne0ctdjchw7ad27vxs294v0qn` (`handled_by_id`),
  KEY `FK8swx5o8xouo7eb3b9bxhpwxo` (`related_project_id`),
  KEY `FKb3bqi44mjskbnwupr31nfq5ui` (`reported_user_id`),
  KEY `FKd3qiw2om5d2oh5xb7fbdcq225` (`reporter_id`),
  CONSTRAINT `FKne0ctdjchw7ad27vxs294v0qn` FOREIGN KEY (`handled_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK8swx5o8xouo7eb3b9bxhpwxo` FOREIGN KEY (`related_project_id`) REFERENCES `projects` (`id`),
  CONSTRAINT `FKb3bqi44mjskbnwupr31nfq5ui` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKd3qiw2om5d2oh5xb7fbdcq225` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;


/*!40014 SET FOREIGN_KEY_CHECKS=1 */;
