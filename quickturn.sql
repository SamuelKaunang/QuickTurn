-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 22, 2025 at 10:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quickturn`
--

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` bigint(20) NOT NULL,
  `owner_id` bigint(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(100) NOT NULL,
  `budget` decimal(15,2) NOT NULL,
  `deadline` date NOT NULL,
  `status` enum('OPEN','ONGOING','DONE','CLOSED') NOT NULL DEFAULT 'OPEN',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_applications`
--

CREATE TABLE `project_applications` (
  `id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `applicant_id` bigint(20) NOT NULL,
  `proposal_text` text NOT NULL,
  `bid_amount` decimal(15,2) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(100) NOT NULL,
  `role` enum('ADMIN','UMKM','MAHASISWA') NOT NULL DEFAULT 'MAHASISWA',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `email`, `password_hash`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@sistem.com', '$2y$10$dummyhashuntukpasswordadmin123', 'ADMIN', 1, NULL, '2025-11-22 16:37:40', '2025-11-22 16:37:40'),
(2, 'Warung Sejahtera', 'owner@warung.com', '$2y$10$dummyhashuntukpasswordumkm123', 'UMKM', 1, NULL, '2025-11-22 16:37:40', '2025-11-22 16:37:40'),
(3, 'Budi Santoso', 'budi.santoso@student.com', '$2y$10$dummyhashuntukpasswordmhs123', 'MAHASISWA', 1, NULL, '2025-11-22 16:37:40', '2025-11-22 16:37:40'),
(4, 'Siti Nurbaya', 'siti.n@student.com', '$2y$10$dummyhashuntukpasswordsiti123', 'MAHASISWA', 0, NULL, '2025-11-22 16:37:40', '2025-11-22 16:37:40'),
(5, 'Kopi Kenangan Mantan', 'kopi@umkm.com', '$2y$10$dummyhashuntukpasswordkopi123', 'UMKM', 1, NULL, '2025-11-22 16:37:40', '2025-11-22 16:37:40'),
(6, 'Mahasiswa Test', 'test@student.com', '$2a$10$SAvTG4ytIkYPm47KUmebtei4kKjRyK6lWlSVCN/4Ztd5uY4LE5ZUK', 'MAHASISWA', 1, NULL, '2025-11-22 16:47:05', '2025-11-22 16:47:05');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `project_applications`
--
ALTER TABLE `project_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`),
  ADD KEY `applicant_id` (`applicant_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_applications`
--
ALTER TABLE `project_applications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_project_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `project_applications`
--
ALTER TABLE `project_applications`
  ADD CONSTRAINT `fk_app_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_app_user` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
