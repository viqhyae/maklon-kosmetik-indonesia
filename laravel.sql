-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Apr 11, 2026 at 07:31 AM
-- Server version: 8.4.8
-- PHP Version: 8.3.30

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
-- Table structure for table `app_settings`
--

CREATE TABLE `app_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_settings`
--

INSERT INTO `app_settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'max_valid_scan_limit', '3', '2026-04-04 14:33:21', '2026-04-11 08:43:56'),
(2, 'require_gps', '0', '2026-04-04 14:33:21', '2026-04-11 14:15:26'),
(3, 'email_notif', '1', '2026-04-04 14:33:21', '2026-04-10 16:55:38');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `brand_code`, `owner_name`, `description`, `logo_url`, `status`, `created_at`, `updated_at`) VALUES
(140, 'Indogrosir', 'CL-2387', 'Ibu Clara', 'Noted', 'logos/PBPJUsQHuuzCoUZ4fkIlWq34fHipmjpK7y8M6vyb.png', 1, '2026-03-14 04:27:28', '2026-03-16 07:31:16'),
(151, 'ASDASD', 'CL-7045', 'Ibu Clara', 'ASDASDASD', 'logos/aRCCNqZNGgrh4bzvvUIb8jv7Dcr1lp5Bm5PENRry.jpg', 1, '2026-03-14 08:56:53', '2026-04-03 02:47:19'),
(155, 'AAA', 'CL-9995', 'Ibu Clara', 'Noteddfdfg', 'logos/U5GIMCpRTfx1wH5RYRiENXwerb4yKZtYoRmEDXIV.png', 1, '2026-03-16 01:26:10', '2026-04-03 02:47:19'),
(171, 'Glow & Co', 'GLW-001', NULL, 'Auto-seeded untuk master SKU produk.', NULL, 1, '2026-04-03 08:36:11', '2026-04-03 08:36:11'),
(172, 'DermaBeauty', 'DRM-001', NULL, 'Auto-seeded untuk master SKU produk.', NULL, 1, '2026-04-03 08:36:11', '2026-04-03 08:36:11'),
(173, 'Luxe Scents', 'LXS-001', NULL, 'Auto-seeded untuk master SKU produk.', NULL, 0, '2026-04-03 08:36:11', '2026-04-11 09:32:09'),
(174, 'PureNaturals', 'PRN-001', 'Viqhy', 'Auto-seeded untuk master SKU produk.', 'logos/HCsj0MF6hKQCpNZxwTAhdOBqQXsENp3LVQbfb7kU.png', 0, '2026-04-03 08:36:11', '2026-04-11 09:25:04'),
(175, 'Men\'s Groom', 'MGR-001', NULL, 'Auto-seeded untuk master SKU produk.', NULL, 0, '2026-04-03 08:36:11', '2026-04-03 09:21:09'),
(176, 'fsdfsdf', 'CL-6077', 'Viqhy', 'dsff', NULL, 0, '2026-04-10 09:44:35', '2026-04-11 09:24:59');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-ip_api_public_ip_self', 's:15:\"158.140.163.219\";', 1775661895),
('laravel-cache-legacy_ip_api_geo_158.140.163.219', 'a:4:{s:14:\"location_label\";s:9:\"Malang,ID\";s:8:\"latitude\";d:-7.9826;s:9:\"longitude\";d:112.6308;s:10:\"ip_address\";s:15:\"158.140.163.219\";}', 1775835320),
('laravel-cache-legacy_ip_api_public_ip_self', 's:15:\"158.140.163.219\";', 1775893296),
('laravel-cache-legacy_ip_geo_payload_v3_158.140.163.219', 'a:4:{s:14:\"location_label\";s:9:\"Malang,ID\";s:8:\"latitude\";d:-7.9826;s:9:\"longitude\";d:112.6308;s:10:\"ip_address\";s:15:\"158.140.163.219\";}', 1775899524),
('laravel-cache-legacy_ip_geo_payload_v3_self', 'a:4:{s:14:\"location_label\";s:9:\"Malang,ID\";s:8:\"latitude\";d:-7.9826;s:9:\"longitude\";d:112.6308;s:10:\"ip_address\";s:15:\"158.140.163.219\";}', 1775899524),
('laravel-cache-legacy_reverse_geo_11c7e2cf3c303749249a64090d3c3a596449a67f', 'a:4:{s:14:\"location_label\";s:11:\"Surabaya,ID\";s:8:\"latitude\";d:-7.276062;s:9:\"longitude\";d:112.700475;s:10:\"ip_address\";N;}', 1775721699),
('laravel-cache-legacy_reverse_geo_35cab6c4c8bbeda6cfd7032863b7285543de5a33', 'a:4:{s:14:\"location_label\";s:11:\"Surabaya,ID\";s:8:\"latitude\";d:-7.276085;s:9:\"longitude\";d:112.700961;s:10:\"ip_address\";N;}', 1775835232),
('laravel-cache-legacy_reverse_geo_5ee82051bc9e948cbc328993e2b34a379e73ee8c', 'a:4:{s:14:\"location_label\";s:18:\"Jakarta Selatan,ID\";s:8:\"latitude\";d:-6.208763;s:9:\"longitude\";d:106.845599;s:10:\"ip_address\";N;}', 1775661921),
('laravel-cache-legacy_reverse_geo_async_00222dc3b037f3447c2be9e39b28fa2ce040bdfd', 's:11:\"Surabaya,ID\";', 1775903498),
('laravel-cache-legacy_reverse_geo_async_01483645c47525bdfffaf410a89556fdc16acbe0', 's:11:\"Surabaya,ID\";', 1775900281),
('laravel-cache-legacy_reverse_geo_async_0218a5a3585c7a5185238d14ad56b4170629ba54', 's:11:\"Surabaya,ID\";', 1775903239),
('laravel-cache-legacy_reverse_geo_async_4cccc734c80882bec7ed5b03793e6254cc8dac94', 's:11:\"Surabaya,ID\";', 1775903378),
('laravel-cache-legacy_reverse_geo_async_62ff1f8936547b9aa528e3f8a258ce8d3ab5c166', 's:11:\"Surabaya,ID\";', 1775899644),
('laravel-cache-legacy_reverse_geo_async_b10f27626a8a8d083ba8cd13f2bc1afca0005f0e', 's:11:\"Surabaya,ID\";', 1775903609),
('laravel-cache-legacy_reverse_geo_async_cd15f8a3b6dbda004243cb920a1ada4a1662140a', 's:11:\"Surabaya,ID\";', 1775903658),
('laravel-cache-legacy_reverse_geo_async_f568806da3ede758b951a8ff00f8b8df19a2ad0b', 's:11:\"Surabaya,ID\";', 1775896724),
('laravel-cache-legacy_reverse_geo_async_fdca68994da45de3ff31d11d33522b3724a2c847', 's:11:\"Surabaya,ID\";', 1775897445),
('laravel-cache-legacy_reverse_geo_f1d7195472de4925908bf0d1a712d6fff5e362f8', 'a:4:{s:14:\"location_label\";s:11:\"Surabaya,ID\";s:8:\"latitude\";d:-7.276094;s:9:\"longitude\";d:112.70102;s:10:\"ip_address\";N;}', 1775893297),
('laravel-cache-reverse_geo_location_5aee2c96f318dce99519230dbe3d99b2e6aea2c3', 's:11:\"Surabaya,ID\";', 1775661895);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
(6, '2026_03_14_014313_add_status_to_brands_table', 4),
(7, '2026_03_14_110500_convert_brand_status_to_integer', 5),
(8, '2026_03_14_121000_create_product_categories_table', 5),
(9, '2026_03_14_121100_seed_initial_product_categories', 5),
(10, '2026_03_16_090000_add_role_and_status_to_users_table', 6),
(11, '2026_03_16_100000_add_logo_url_to_brands_table', 6),
(12, '2026_03_16_120000_add_owner_sync_indexes', 7),
(13, '2026_03_16_130000_create_tag_batches_table', 8),
(14, '2026_03_16_130100_create_tag_codes_table', 8),
(15, '2026_04_03_070000_create_product_skus_table', 9),
(16, '2026_04_03_073000_add_image_url_to_product_skus_table', 10),
(17, '2026_04_03_090000_create_scan_activities_table', 11),
(18, '2026_04_04_110000_create_app_settings_table', 12),
(19, '2026_04_09_090500_add_suspend_reason_to_tag_batches_and_scan_activities_table', 13),
(20, '2026_04_10_103000_sync_product_categories_from_latest_excel', 14),
(21, '2026_04_11_120000_add_performance_indexes_for_scan_and_user_actions', 15);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` bigint UNSIGNED NOT NULL,
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint UNSIGNED NOT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `parent_id`, `name`, `level`, `sort_order`, `created_at`, `updated_at`) VALUES
(177, NULL, 'Perawatan & Kecantikan', 1, 1, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(178, 177, 'Parfum & Wewangian', 2, 1, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(179, 177, 'Perawatan Wajah', 2, 2, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(180, 179, 'Pembersih Wajah', 3, 1, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(181, 179, 'Toner', 3, 2, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(182, 179, 'Pelembab Wajah', 3, 3, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(183, 179, 'Facial Mist', 3, 4, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(184, 179, 'Serum & Essence Wajah', 3, 5, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(185, 179, 'Scrub & Peel Wajah', 3, 6, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(186, 179, 'Masker Wajah', 3, 7, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(187, 179, 'Sunscreen Wajah', 3, 8, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(188, 179, 'Perawatan Wajah Lainnya', 3, 9, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(189, 177, 'Body Care', 2, 3, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(190, 189, 'Sabun Mandi', 3, 1, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(191, 189, 'Scrub & Peel Tubuh', 3, 2, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(192, 189, 'Body Cream, Body Lotion & Body Butter', 3, 3, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(193, 189, 'Deodoran', 3, 4, '2026-04-10 14:14:55', '2026-04-10 14:14:55'),
(194, 189, 'Perawatan Tubuh Lainnya', 3, 5, '2026-04-10 14:14:55', '2026-04-10 14:14:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_skus`
--

CREATE TABLE `product_skus` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` bigint UNSIGNED DEFAULT NULL,
  `category_l1_id` bigint UNSIGNED DEFAULT NULL,
  `category_l2_id` bigint UNSIGNED DEFAULT NULL,
  `category_l3_id` bigint UNSIGNED DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dynamic_fields` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_skus`
--

INSERT INTO `product_skus` (`id`, `name`, `sku_code`, `brand_id`, `category_l1_id`, `category_l2_id`, `category_l3_id`, `description`, `image_url`, `dynamic_fields`, `created_at`, `updated_at`) VALUES
(13, 'PRODUK 1', 'HRN12ONV', 171, 177, 179, 181, NULL, NULL, '{\"noIzinEdar\": \"ASDQWEQ\", \"masaPenyimpanan\": \"24 Bulan\"}', '2026-04-10 15:06:50', '2026-04-10 15:06:50'),
(14, 'PRODUK 2', 'ASDAQ1SADA', 140, 177, 178, NULL, NULL, NULL, '{\"formulasi\": \"Cream\", \"tipePaket\": \"Single\", \"jenisKelamin\": \"Pria\", \"ukuranProduk\": \"Sedang\", \"masaPenyimpanan\": \"6 Bulan\", \"tanggalKedaluwarsa\": \"2026-04-22\"}', '2026-04-10 15:08:36', '2026-04-10 15:08:36');

-- --------------------------------------------------------

--
-- Table structure for table `scan_activities`
--

CREATE TABLE `scan_activities` (
  `id` bigint UNSIGNED NOT NULL,
  `scanned_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag_code_id` bigint UNSIGNED DEFAULT NULL,
  `verification_code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tag_status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Invalid',
  `suspend_reason` text COLLATE utf8mb4_unicode_ci,
  `scan_count` int UNSIGNED NOT NULL DEFAULT '0',
  `location_label` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `scanned_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `scan_activities`
--

INSERT INTO `scan_activities` (`id`, `scanned_code`, `tag_code_id`, `verification_code`, `product_name`, `brand_name`, `tag_status`, `result_status`, `suspend_reason`, `scan_count`, `location_label`, `latitude`, `longitude`, `ip_address`, `user_agent`, `scanned_at`, `created_at`, `updated_at`) VALUES
(1, 'C0G3A', NULL, 'C0G3A', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 1, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-10 16:47:42', '2026-04-10 16:47:42', '2026-04-10 16:47:42'),
(2, 'C0G3A', NULL, 'C0G3A', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 2, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-10 16:48:56', '2026-04-10 16:48:56', '2026-04-10 16:48:56'),
(3, 'C0G3A', NULL, 'C0G3A', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 3, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-10 16:50:02', '2026-04-10 16:50:02', '2026-04-10 16:50:02'),
(4, 'NHEUA', NULL, 'NHEUA', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 1, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-10 16:51:43', '2026-04-10 16:51:43', '2026-04-10 16:51:43'),
(5, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 1, 'Surabaya,ID', -7.2760940, 112.7010200, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 08:41:33', '2026-04-11 08:41:37', '2026-04-11 08:41:37'),
(6, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 2, 'Tidak Diketahui', NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:14:53', '2026-04-11 09:14:53', '2026-04-11 09:14:53'),
(7, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 3, 'Tidak Diketahui', NULL, NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:15:26', '2026-04-11 09:15:26', '2026-04-11 09:15:26'),
(8, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 4, 'IP 172.21.0.1', NULL, NULL, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:25:33', '2026-04-11 09:25:33', '2026-04-11 09:25:33'),
(9, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 5, 'IP 172.21.0.1', NULL, NULL, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:26:25', '2026-04-11 09:26:25', '2026-04-11 09:26:25'),
(10, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 6, 'IP 172.21.0.1', NULL, NULL, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:33:48', '2026-04-11 09:33:48', '2026-04-11 09:33:48'),
(11, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 1, 'IP 172.21.0.1', NULL, NULL, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:35:54', '2026-04-11 09:35:54', '2026-04-11 09:35:54'),
(12, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 2, 'Surabaya,ID', -7.2760760, 112.7006720, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:38:42', '2026-04-11 09:38:42', '2026-04-11 09:38:44'),
(13, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Original', NULL, 3, 'Surabaya,ID', -7.2760760, 112.7006720, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:50:20', '2026-04-11 09:50:20', '2026-04-11 09:50:21'),
(14, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 7, 'Surabaya,ID', -7.2760810, 112.7007590, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:50:43', '2026-04-11 09:50:43', '2026-04-11 09:50:45'),
(15, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 8, 'Surabaya,ID', -7.2760810, 112.7007590, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:51:13', '2026-04-11 09:51:13', '2026-04-11 09:51:13'),
(16, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 9, 'Surabaya,ID', -7.2760810, 112.7007590, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:51:27', '2026-04-11 09:51:27', '2026-04-11 09:51:27'),
(17, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 10, 'IP 172.21.0.1', NULL, NULL, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 09:53:06', '2026-04-11 09:53:06', '2026-04-11 09:53:06'),
(18, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 4, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:25:23', '2026-04-11 10:25:24', '2026-04-11 10:25:24'),
(19, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 5, 'Surabaya,ID', -7.2760970, 112.7010300, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:27:23', '2026-04-11 10:27:23', '2026-04-11 10:27:24'),
(20, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 6, 'Surabaya,ID', -7.2760970, 112.7010300, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:27:28', '2026-04-11 10:27:28', '2026-04-11 10:27:28'),
(21, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 7, 'Surabaya,ID', -7.2760970, 112.7010300, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:30:02', '2026-04-11 10:30:02', '2026-04-11 10:30:02'),
(22, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 8, 'Surabaya,ID', -7.2760850, 112.7010030, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:37:59', '2026-04-11 10:37:59', '2026-04-11 10:38:01'),
(23, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 9, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:39:43', '2026-04-11 10:39:43', '2026-04-11 10:39:43'),
(24, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 10, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:40:23', '2026-04-11 10:40:23', '2026-04-11 10:40:23'),
(25, 'PYRDE', NULL, 'PYRDE', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 11, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 10:49:19', '2026-04-11 10:49:19', '2026-04-11 10:49:19'),
(26, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 11, 'Surabaya,ID', -7.2760950, 112.7009970, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:27:18', '2026-04-11 11:27:18', '2026-04-11 11:27:19'),
(27, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 12, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:29:05', '2026-04-11 11:29:05', '2026-04-11 11:29:05'),
(28, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 13, 'Surabaya,ID', -7.2760910, 112.7009880, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:29:37', '2026-04-11 11:29:37', '2026-04-11 11:29:38'),
(29, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 14, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:30:42', '2026-04-11 11:30:42', '2026-04-11 11:30:42'),
(30, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 15, 'Malang,ID', -7.9826000, 112.6308000, '158.140.163.219', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:31:15', '2026-04-11 11:31:15', '2026-04-11 11:31:15'),
(31, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 16, 'Surabaya,ID', -7.2760650, 112.7008950, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:31:38', '2026-04-11 11:31:38', '2026-04-11 11:31:39'),
(32, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 17, 'Surabaya,ID', -7.2760490, 112.7008310, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:33:28', '2026-04-11 11:33:28', '2026-04-11 11:33:29'),
(33, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 18, 'Surabaya,ID', -7.2760970, 112.7010040, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:34:18', '2026-04-11 11:34:18', '2026-04-11 11:34:18'),
(34, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 19, 'Surabaya,ID', -7.2760970, 112.7010040, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:40:58', '2026-04-11 11:40:58', '2026-04-11 11:40:58'),
(35, 'DFAPX', NULL, 'DFAPX', 'PRODUK 2', 'Indogrosir', 'Aktif', 'Peringatan', NULL, 20, 'Surabaya,ID', -7.2760950, 112.7009970, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 11:41:37', '2026-04-11 11:41:37', '2026-04-11 11:41:37');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('CLH6O2cp8Chl3FYGpG9EQYKIWjaT6UsRbFxIY8S4', 1, '172.21.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiSmVBVUZSc0hFY1BGS2JoeGZhcHFaTFNrZEd1ZHRMNDF4azNXSGI4TCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6Nzc3NyI7czo1OiJyb3V0ZSI7czo0OiJob21lIjt9czozOiJ1cmwiO2E6MDp7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1775892661);

-- --------------------------------------------------------

--
-- Table structure for table `tag_batches`
--

CREATE TABLE `tag_batches` (
  `id` bigint UNSIGNED NOT NULL,
  `batch_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int UNSIGNED NOT NULL,
  `id_length` tinyint UNSIGNED NOT NULL DEFAULT '8',
  `error_correction` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'M',
  `use_pin` tinyint(1) NOT NULL DEFAULT '0',
  `pin_length` tinyint UNSIGNED DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Generated',
  `suspend_reason` text COLLATE utf8mb4_unicode_ci,
  `first_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tag_batches`
--

INSERT INTO `tag_batches` (`id`, `batch_code`, `product_name`, `brand_name`, `quantity`, `id_length`, `error_correction`, `use_pin`, `pin_length`, `status`, `suspend_reason`, `first_code`, `last_code`, `created_by`, `created_at`, `updated_at`) VALUES
(17, 'BATCH-926910', 'PRODUK 2', 'Indogrosir', 100, 5, 'M', 0, NULL, 'Generated', NULL, 'VSHVJ', 'URAHJ', 1, '2026-04-11 14:04:26', '2026-04-11 14:11:37');

-- --------------------------------------------------------

--
-- Table structure for table `tag_codes`
--

CREATE TABLE `tag_codes` (
  `id` bigint UNSIGNED NOT NULL,
  `tag_batch_id` bigint UNSIGNED NOT NULL,
  `verification_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Aktif',
  `pin` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `error_correction` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'M',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tag_codes`
--

INSERT INTO `tag_codes` (`id`, `tag_batch_id`, `verification_code`, `product_name`, `brand_name`, `status`, `pin`, `error_correction`, `created_at`, `updated_at`) VALUES
(3212, 17, 'VSHVJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3213, 17, 'JMVTJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3214, 17, 'BYMAZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3215, 17, 'K0BIN', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3216, 17, 'SPZJW', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3217, 17, 'HN7II', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3218, 17, 'YLURZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3219, 17, 'RSTAT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3220, 17, 'EQVQ4', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3221, 17, 'QZCWU', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3222, 17, 'ZQQFF', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3223, 17, 'IYT3D', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3224, 17, 'QZKZF', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3225, 17, 'I0UGT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3226, 17, 'HS8Z3', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3227, 17, 'TPGD5', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3228, 17, 'KRHHO', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3229, 17, 'KLHQA', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3230, 17, 'FLCGJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3231, 17, 'CVMUR', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3232, 17, '9XNV3', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3233, 17, 'F1DPU', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3234, 17, 'Y4QWI', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3235, 17, 'SHQYP', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3236, 17, 'KVLT4', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3237, 17, 'ILN8K', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3238, 17, 'TUEPT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3239, 17, '1QAWK', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3240, 17, '6OO7T', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3241, 17, 'OUN3U', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3242, 17, 'STSZT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3243, 17, 'DD4TJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3244, 17, 'NK53G', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3245, 17, '7VQC3', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3246, 17, 'ZHHJZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3247, 17, 'E9JTA', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3248, 17, 'XNLID', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3249, 17, 'FH2ZA', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3250, 17, '0YRJS', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3251, 17, 'TSIEV', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3252, 17, 'RZUUG', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3253, 17, 'XLALY', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3254, 17, 'WOMRV', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3255, 17, '4SNM7', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3256, 17, 'WKHYL', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3257, 17, 'N5F93', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3258, 17, 'WJHDJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3259, 17, 'KDZMD', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3260, 17, 'C4WFL', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3261, 17, 'WBREV', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3262, 17, 'F1PQD', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3263, 17, 'NVG11', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3264, 17, 'IMDQP', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3265, 17, 'JUIYN', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3266, 17, 'MBFCZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3267, 17, 'OEPLI', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3268, 17, 'Z8BGK', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3269, 17, 'K81WO', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3270, 17, 'SG5LW', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3271, 17, 'FILKQ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3272, 17, 'FR6JP', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3273, 17, 'KW8GN', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3274, 17, 'OAST8', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3275, 17, '6BSRW', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3276, 17, 'YLSSQ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3277, 17, 'TVOF2', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3278, 17, 'RHGOI', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3279, 17, 'RVEAW', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3280, 17, 'IKNKC', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3281, 17, 'I5YKM', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3282, 17, 'LKTL7', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3283, 17, 'KCBEC', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3284, 17, 'FDFPB', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3285, 17, 'ZLCQT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3286, 17, 'WV96J', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3287, 17, 'RLCGI', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3288, 17, 'EKAVL', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3289, 17, 'DKLWZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3290, 17, 'LRYMT', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3291, 17, 'J3FD2', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3292, 17, 'NII31', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3293, 17, 'BSBTJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3294, 17, 'EULGH', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3295, 17, 'FO5BX', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3296, 17, 'VWDUQ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3297, 17, 'O1WGQ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3298, 17, 'GBEBE', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3299, 17, 'E7L5Y', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3300, 17, 'CHLVE', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3301, 17, 'R7WKY', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3302, 17, '5MIGW', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3303, 17, 'WBIUU', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3304, 17, 'E4FKZ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3305, 17, 'TDMCF', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3306, 17, 'ZKAVV', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3307, 17, 'DRG3E', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3308, 17, 'YQVDG', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3309, 17, '7KQNA', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3310, 17, 'DL954', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37'),
(3311, 17, 'URAHJ', 'PRODUK 2', 'Indogrosir', 'Aktif', NULL, 'M', '2026-04-11 14:04:26', '2026-04-11 14:11:37');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Brand Owner',
  `status` tinyint NOT NULL DEFAULT '1',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `status`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin@gmail.com', 'Super Admin', 1, NULL, '$2y$12$KTpz3JMBk1m28IgCOSna6.ESFDwhCn3Y3vtl6TEDM7OfAFHxf98yy', 'SVN7x9gFZ2lZEEUsCeB0vQ1L5tAYTqLfLVzZe1ktFOnuKnmLoXF69HSM21y2', '2026-03-13 04:00:47', '2026-03-16 07:28:48'),
(3, 'Ibu Clara', 'ibu.clara@auto.local', 'Brand Owner', 0, NULL, '$2y$12$3odn0W4ctM2L2uGWyfeZ9u6eAa4euyny9b.yEjSB/iTS1Pq6UP9aO', NULL, '2026-03-16 03:14:47', '2026-03-16 07:29:49'),
(4, 'Bapak Owner', 'bapak.owner@auto.local', 'Brand Owner', 1, NULL, '$2y$12$5I4XefaBJwLKaAyXTln0Eug8WSOeP1Rwlols1n1KwwBSum.hrR.BW', NULL, '2026-03-16 03:14:48', '2026-04-03 02:48:31'),
(5, 'Viqhy', 'viqhy@gmail.com', 'Brand Owner', 1, NULL, '$2y$12$zQ8y.I/eEnjmqiUsm1F3ke.OuYKN67ZFr1JVWNzeMXRFjRg8yzj3q', 'xB0937y7tE0atibJ7GWbNeRI1ncUR5uUw2041q6ikscFcOnOLhsvCFWWbDwn', '2026-03-16 06:54:57', '2026-04-11 11:56:45'),
(6, 'Anjay', 'anjay@gmail.com', 'Brand Owner', 0, NULL, '$2y$12$fp.bSi7BcshmfEvonX6CK.E./7dtipXOGxXbuUkLKh0DIMjMV1Hoq', NULL, '2026-04-03 06:09:27', '2026-04-10 09:03:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `app_settings`
--
ALTER TABLE `app_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `app_settings_key_unique` (`key`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `brands_brand_code_unique` (`brand_code`),
  ADD KEY `brands_owner_name_index` (`owner_name`);

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
-- Indexes for table `product_skus`
--
ALTER TABLE `product_skus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_skus_sku_code_unique` (`sku_code`),
  ADD KEY `product_skus_category_l1_id_foreign` (`category_l1_id`),
  ADD KEY `product_skus_category_l2_id_foreign` (`category_l2_id`),
  ADD KEY `product_skus_brand_name_index` (`brand_id`,`name`),
  ADD KEY `product_skus_category_l3_index` (`category_l3_id`);

--
-- Indexes for table `scan_activities`
--
ALTER TABLE `scan_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scan_activities_code_scanned_index` (`verification_code`,`scanned_at`),
  ADD KEY `scan_activities_status_scanned_index` (`result_status`,`scanned_at`),
  ADD KEY `scan_activities_tag_code_id_foreign` (`tag_code_id`),
  ADD KEY `scan_activities_scanned_code_index` (`scanned_code`),
  ADD KEY `scan_activities_brand_id_index` (`brand_name`,`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `tag_batches`
--
ALTER TABLE `tag_batches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_batches_batch_code_unique` (`batch_code`),
  ADD KEY `tag_batches_created_by_foreign` (`created_by`),
  ADD KEY `tag_batches_status_created_index` (`status`,`created_at`);

--
-- Indexes for table `tag_codes`
--
ALTER TABLE `tag_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_codes_verification_code_unique` (`verification_code`),
  ADD KEY `tag_codes_batch_status_index` (`tag_batch_id`,`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_name_index` (`name`),
  ADD KEY `users_role_status_index` (`role`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `app_settings`
--
ALTER TABLE `app_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=179;

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
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=196;

--
-- AUTO_INCREMENT for table `product_skus`
--
ALTER TABLE `product_skus`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `scan_activities`
--
ALTER TABLE `scan_activities`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `tag_batches`
--
ALTER TABLE `tag_batches`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `tag_codes`
--
ALTER TABLE `tag_codes`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3312;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD CONSTRAINT `product_categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_skus`
--
ALTER TABLE `product_skus`
  ADD CONSTRAINT `product_skus_brand_id_foreign` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_skus_category_l1_id_foreign` FOREIGN KEY (`category_l1_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_skus_category_l2_id_foreign` FOREIGN KEY (`category_l2_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `product_skus_category_l3_id_foreign` FOREIGN KEY (`category_l3_id`) REFERENCES `product_categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `scan_activities`
--
ALTER TABLE `scan_activities`
  ADD CONSTRAINT `scan_activities_tag_code_id_foreign` FOREIGN KEY (`tag_code_id`) REFERENCES `tag_codes` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tag_batches`
--
ALTER TABLE `tag_batches`
  ADD CONSTRAINT `tag_batches_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tag_codes`
--
ALTER TABLE `tag_codes`
  ADD CONSTRAINT `tag_codes_tag_batch_id_foreign` FOREIGN KEY (`tag_batch_id`) REFERENCES `tag_batches` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
