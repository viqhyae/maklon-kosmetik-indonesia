-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Mar 16, 2026 at 01:31 AM
-- Server version: 8.4.8
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `laravel`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `brand_code`, `owner_name`, `description`, `logo_url`, `status`, `created_at`, `updated_at`) VALUES
(140, 'Indogrosir', 'CL-2387', 'Bapak Owner', 'Noted', 'logos/PBPJUsQHuuzCoUZ4fkIlWq34fHipmjpK7y8M6vyb.png', 1, '2026-03-14 04:27:28', '2026-03-16 01:28:43'),
(151, 'ASDASD', 'CL-7045', 'Ibu Clara', 'ASDASDASD', 'logos/aRCCNqZNGgrh4bzvvUIb8jv7Dcr1lp5Bm5PENRry.jpg', 0, '2026-03-14 08:56:53', '2026-03-16 01:28:29'),
(155, 'AAA', 'CL-9995', 'Ibu Clara', 'Noted', 'logos/U5GIMCpRTfx1wH5RYRiENXwerb4yKZtYoRmEDXIV.png', 1, '2026-03-16 01:26:10', '2026-03-16 01:28:43');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_03_13_040140_create_brands_table', 2),
(5, '2026_03_13_092500_add_logo_url_to_brands_table', 3),
(6, '2026_03_14_014313_add_status_to_brands_table', 4),
(7, '2026_03_14_110500_convert_brand_status_to_integer', 5),
(8, '2026_03_14_121000_create_product_categories_table', 5),
(9, '2026_03_14_121100_seed_initial_product_categories', 5);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint UNSIGNED NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `parent_id`, `name`, `level`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, NULL, 'Perawatan & Kecantikan', 1, 1, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(11, 1, 'Parfum & Wewangian', 2, 1, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(12, 1, 'Perawatan Wajah', 2, 2, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(13, 1, 'Perawatan Tubuh', 2, 3, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(111, 11, 'Eau De Parfum (EDP)', 3, 1, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(112, 11, 'Eau De Toilette (EDT)', 3, 2, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(113, 11, 'Body Mist / Cologne', 3, 3, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(114, 11, 'Extrait De Parfum', 3, 4, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(121, 12, 'Pembersih Wajah', 3, 1, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(122, 12, 'Toner', 3, 2, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(123, 12, 'Pelembab Wajah', 3, 3, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(124, 12, 'Minyak Wajah', 3, 4, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(125, 12, 'Facial Mist', 3, 5, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(126, 12, 'Serum & Essence Wajah', 3, 6, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(127, 12, 'Scrub & Peel Wajah', 3, 7, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(128, 12, 'Masker Wajah', 3, 8, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(129, 12, 'Treatment Mata', 3, 9, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(130, 12, 'Treatment Bibir', 3, 10, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(131, 13, 'Sabun Mandi', 3, 1, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(132, 13, 'Scrub & Peel Tubuh', 3, 2, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(133, 13, 'Masker Tubuh', 3, 3, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(134, 13, 'Minyak Tubuh', 3, 4, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(135, 13, 'Body Cream, Lotion & Butter', 3, 5, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(136, 13, 'Deodoran', 3, 6, '2026-03-14 07:07:07', '2026-03-14 07:07:07'),
(154, NULL, 'A', 1, 2, '2026-03-14 08:55:17', '2026-03-14 08:55:17'),
(156, 154, 'AA', 2, 1, '2026-03-14 08:58:27', '2026-03-14 08:58:27'),
(157, 156, 'AAA', 3, 1, '2026-03-14 08:58:34', '2026-03-14 08:58:34'),
(158, 156, 'AAA', 3, 2, '2026-03-14 08:58:34', '2026-03-14 08:58:34'),
(159, 156, 'AAA', 3, 2, '2026-03-14 08:58:34', '2026-03-14 08:58:34'),
(160, 156, 'AAA', 3, 2, '2026-03-14 08:58:34', '2026-03-14 08:58:34'),
(161, 156, 'AAA', 3, 2, '2026-03-14 08:58:34', '2026-03-14 08:58:34'),
(162, 156, 'ABB', 3, 3, '2026-03-14 08:58:48', '2026-03-14 08:58:48'),
(163, 156, 'ABB', 3, 3, '2026-03-14 08:58:48', '2026-03-14 08:58:48'),
(164, 156, 'ABB', 3, 3, '2026-03-14 08:58:48', '2026-03-14 08:58:48'),
(165, 156, '1242535235', 3, 4, '2026-03-14 08:59:08', '2026-03-14 08:59:08');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('E9EmwNaJYmN4mgrlBQBTnfvv8U1o8q5HIlqRGDFb', 1, '172.27.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiQlVYVmQ1NUtqY1F1MUpqdXFzUkxiMUFXNnhCUVE1cWdLRk1ESVFXSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzE6Imh0dHA6Ly9sb2NhbGhvc3Q6Nzc3Ny9kYXNoYm9hcmQiO3M6NToicm91dGUiO3M6OToiZGFzaGJvYXJkIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo1MDoibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiO2k6MTt9', 1773624636);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@gmail.com', NULL, '$2y$12$KTpz3JMBk1m28IgCOSna6.ESFDwhCn3Y3vtl6TEDM7OfAFHxf98yy', 'gcHZvDuFG4kYxbY0d5VJJwvQs43ocwW32QPCWTLx61VaDruyK9ANgKAMEAeH', '2026-03-13 04:00:47', '2026-03-13 04:00:47');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_brand_code_unique` (`brand_code`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_reserved_at_available_at_index` (`queue`,`reserved_at`,`available_at`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_categories_parent_id_sort_order_index` (`parent_id`,`sort_order`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
