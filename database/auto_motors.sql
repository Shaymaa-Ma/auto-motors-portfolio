-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 10, 2026 at 06:49 AM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `auto_motors`
--

-- --------------------------------------------------------

--
-- Table structure for table `about`
--

DROP TABLE IF EXISTS `about`;
CREATE TABLE IF NOT EXISTS `about` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `mission_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mission_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mission_fr` text COLLATE utf8mb4_unicode_ci,
  `mission_en` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_button_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_button_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_button_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_button_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_button_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_button_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `about`
--

INSERT INTO `about` (`id`, `title_fr`, `title_en`, `subtitle_fr`, `subtitle_en`, `description_fr`, `description_en`, `mission_title_fr`, `mission_title_en`, `mission_fr`, `mission_en`, `image`, `primary_button_fr`, `primary_button_en`, `primary_button_link`, `secondary_button_fr`, `secondary_button_en`, `secondary_button_link`, `created_at`, `updated_at`) VALUES
(1, 'Votre partenaire en produits automobiles', 'Your Automotive Products Partner', 'Des produits de qualité et un service fiable', 'Quality products and reliable service', 'Nous sommes spécialisés dans la vente de pièces automobiles, notamment les batteries, lubrifiants, pneus et pièces détachées. Nous proposons des produits de qualité et un service fiable.', 'We specialize in the sale of automotive products and spare parts, including batteries, lubricants, tires, and various vehicle components. We provide quality products and reliable service.', 'Notre mission', 'Our Mission', 'Fournir des pièces de qualité à des prix compétitifs.', 'Provide quality automotive parts at competitive prices.', 'about/about-main.jpg', 'Découvrir nos produits', 'Explore Our Products', '#products', 'Nous contacter', 'Contact Us', '#contact', '2026-09-05 12:55:50', '2026-09-09 03:21:09');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Development Admin', 'admin@automotors.local', '$2b$12$ja4yoCc2De0Eed2qjLqUDOTYorPomzLrpl2xxr0X.m2.apmndxQ0.', 'admin', 1, '2026-09-08 13:56:39', '2026-09-08 13:56:39');

-- --------------------------------------------------------

--
-- Table structure for table `advantages`
--

DROP TABLE IF EXISTS `advantages`;
CREATE TABLE IF NOT EXISTS `advantages` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `title_fr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advantages`
--

INSERT INTO `advantages` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `title_fr`, `title_en`, `description_fr`, `description_en`, `icon`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'La qualité au service de nos clients', 'Quality at the Service of Our Customers', 'Notre engagement pour des produits fiables et un service professionnel', 'Our commitment to reliable products and professional service', 'Produits de qualité', 'Quality Products', 'Nous proposons des produits de qualité pour répondre aux besoins de nos clients.', 'We provide quality products to meet our customers’ needs.', 'bi-award', 1, 1, '2026-09-05 07:20:28', '2026-09-09 08:07:15'),
(2, 'La qualité au service de nos clients', 'Quality at the Service of Our Customers', 'Notre engagement pour des produits fiables et un service professionnel', 'Our commitment to reliable products and professional service', 'Prix compétitifs', 'Competitive Prices', 'Des prix compétitifs pour les particuliers et les professionnels.', 'Competitive prices for individuals and professionals.', 'bi-tags', 2, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:39'),
(3, 'La qualité au service de nos clients', 'Quality at the Service of Our Customers', 'Notre engagement pour des produits fiables et un service professionnel', 'Our commitment to reliable products and professional service', 'Importation fiable', 'Reliable Importation', 'Une activité d’importation dédiée aux produits et équipements automobiles.', 'Reliable importation of automotive products and equipment.', 'bi-box-seam', 3, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:39'),
(4, 'La qualité au service de nos clients', 'Quality at the Service of Our Customers', 'Notre engagement pour des produits fiables et un service professionnel', 'Our commitment to reliable products and professional service', 'Large gamme de produits', 'Wide Range of Products', 'Une gamme comprenant batteries, pneus, lubrifiants et pièces détachées.', 'A range including batteries, tires, lubricants and spare parts.', 'bi-grid-3x3-gap', 4, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:39'),
(5, 'La qualité au service de nos clients', 'Quality at the Service of Our Customers', 'Notre engagement pour des produits fiables et un service professionnel', 'Our commitment to reliable products and professional service', 'Distribution partout en Côte d’Ivoire', 'Distribution Throughout Côte d’Ivoire', 'Distribution de nos produits dans différentes régions de la Côte d’Ivoire.', 'Distribution of our products across different regions of Côte d’Ivoire.', 'bi-truck', 5, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:39');

-- --------------------------------------------------------

--
-- Table structure for table `company_info`
--

DROP TABLE IF EXISTS `company_info`;
CREATE TABLE IF NOT EXISTS `company_info` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagline_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tagline_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `about_fr` text COLLATE utf8mb4_unicode_ci,
  `about_en` text COLLATE utf8mb4_unicode_ci,
  `mission_fr` text COLLATE utf8mb4_unicode_ci,
  `mission_en` text COLLATE utf8mb4_unicode_ci,
  `address_fr` text COLLATE utf8mb4_unicode_ci,
  `address_en` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_1` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_2` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_3` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_info`
--

INSERT INTO `company_info` (`id`, `company_name`, `tagline_fr`, `tagline_en`, `about_fr`, `about_en`, `mission_fr`, `mission_en`, `address_fr`, `address_en`, `email`, `phone_1`, `phone_2`, `phone_3`, `logo`, `created_at`, `updated_at`) VALUES
(1, 'AUTO MOTORS SARL', 'Votre partenaire en produits automobiles', 'Your Automotive Products Partner', 'Nous sommes spécialisés dans la vente de pièces automobiles, notamment les batteries, lubrifiants, pneus et pièces détachées. Nous proposons des produits de qualité et un service fiable.', 'We specialize in the sale of automotive products and spare parts, including batteries, lubricants, tires, and various vehicle components. We provide quality products and reliable service.', 'Fournir des pièces de qualité à des prix compétitifs.', 'Provide quality automotive parts at competitive prices.', 'San Pedro, Gar Cartier Sotref, en face de SACC Cacao. Nous proposons également la livraison selon les besoins de nos clients.', 'San Pedro, Gar Cartier Sotref, opposite SACC Cacao. We also provide delivery according to our customers’ needs.', 'Motorsauto166@gmail.com', '0749616161', '0778969396', '0708236417', 'logo/company-logo.jpg', '2026-09-05 07:20:28', '2026-09-05 13:06:55');

-- --------------------------------------------------------

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
CREATE TABLE IF NOT EXISTS `faqs` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `question_fr` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_en` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_fr` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_en` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faqs`
--

INSERT INTO `faqs` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `question_fr`, `question_en`, `answer_fr`, `answer_en`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Vous avez des questions ?', 'Have Questions?', 'Retrouvez les réponses aux questions les plus fréquentes', 'Find answers to the most frequently asked questions', 'Quels produits proposez-vous ?', 'What products do you offer?', 'Nous proposons des batteries, pneus, lubrifiants, huiles moteur et différentes pièces détachées automobiles.', 'We offer batteries, tires, lubricants, motor oils and various automotive spare parts.', 1, 1, '2026-09-05 07:20:28', '2026-09-09 08:44:50'),
(2, 'Vous avez des questions ?', 'Have Questions?', 'Retrouvez les réponses aux questions les plus fréquentes', 'Find answers to the most frequently asked questions', 'Proposez-vous la livraison ?', 'Do you offer delivery?', 'Oui, nous proposons la livraison selon les besoins de nos clients.', 'Yes, we provide delivery according to our customers’ needs.', 2, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(3, 'Vous avez des questions ?', 'Have Questions?', 'Retrouvez les réponses aux questions les plus fréquentes', 'Find answers to the most frequently asked questions', 'Faites-vous de la vente en gros ?', 'Do you offer wholesale?', 'Oui, nous fournissons nos produits aux magasins, revendeurs et professionnels.', 'Yes, we supply our products to stores, resellers and professionals.', 3, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(4, 'Vous avez des questions ?', 'Have Questions?', 'Retrouvez les réponses aux questions les plus fréquentes', 'Find answers to the most frequently asked questions', 'Où êtes-vous situés ?', 'Where are you located?', 'Nous sommes situés à San Pedro, Gar Cartier Sotref, en face de SACC Cacao.', 'We are located in San Pedro, Gar Cartier Sotref, opposite SACC Cacao.', 4, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(5, 'Vous avez des questions ?', 'Have Questions?', 'Retrouvez les réponses aux questions les plus fréquentes', 'Find answers to the most frequently asked questions', 'Comment pouvons-nous vous contacter ?', 'How can we contact you?', 'Vous pouvez nous contacter par téléphone ou par email.', 'You can contact us by phone or email.', 5, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
CREATE TABLE IF NOT EXISTS `gallery` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `title_fr`, `title_en`, `description_fr`, `description_en`, `image`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Notre entreprise', 'Our Company', 'Découvrez l’environnement et les installations d’AUTO MOTORS SARL.', 'Discover the environment and facilities of AUTO MOTORS SARL.', 'gallery/company.jpg', 1, 1, '2026-09-05 07:20:28', '2026-09-09 08:36:22'),
(2, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Nos produits', 'Our Products', 'Une sélection de produits automobiles.', 'A selection of automotive products.', 'gallery/products.jpg', 2, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(3, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Notre équipe', 'Our Team', 'Une équipe dédiée au service de nos clients.', 'A team dedicated to serving our customers.', 'gallery/team.jpg', 3, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(4, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Notre espace de travail', 'Our Workplace', 'Un environnement organisé pour assurer un service fiable.', 'An organized environment designed to provide reliable service.', 'gallery/workplace.jpg', 4, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(5, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Distribution', 'Distribution', 'Distribution de nos produits selon les besoins de nos clients.', 'Distribution of our products according to our customers’ needs.', 'gallery/distribution.jpg', 5, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(6, 'Découvrez notre activité', 'Discover Our Business', 'Un aperçu de notre entreprise, de nos produits et de notre activité', 'An overview of our company, products and activities', 'Pièces automobiles', 'Automotive Parts', 'Différentes pièces et équipements automobiles.', 'Different automotive parts and equipment.', 'gallery/spare-parts.jpg', 6, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `hero`
--

DROP TABLE IF EXISTS `hero`;
CREATE TABLE IF NOT EXISTS `hero` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `primary_button_fr` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `primary_button_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_button_fr` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `secondary_button_en` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `background_image_desktop` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `background_image_mobile` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hero`
--

INSERT INTO `hero` (`id`, `title_fr`, `title_en`, `subtitle_fr`, `subtitle_en`, `description_fr`, `description_en`, `primary_button_fr`, `primary_button_en`, `secondary_button_fr`, `secondary_button_en`, `background_image_desktop`, `created_at`, `updated_at`, `background_image_mobile`) VALUES
(1, 'AUTO MOTORS SARL', 'AUTO MOTORS SARL', 'Votre partenaire en pièces automobiles', 'Your Automotive Parts Partner', 'Des produits de qualité, des prix compétitifs et un service fiable pour répondre aux besoins des particuliers et des professionnels.', 'Quality products, competitive prices and reliable service to meet the needs of individuals and professionals.', 'Découvrir nos produits', 'Explore Our Products', 'Nous contacter', 'Contact Us', 'hero/hero-main-desktop.jpg', '2026-09-05 07:20:28', '2026-09-09 11:50:35', 'hero/hero-main-mobile.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` int UNSIGNED DEFAULT NULL,
  `name_fr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `price` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_products_category` (`category_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name_fr`, `name_en`, `description_fr`, `description_en`, `price`, `image`, `image_number`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Batterie automobile 12V', '12V Automotive Battery', 'Batterie destinée aux véhicules automobiles.', 'Battery designed for automotive vehicles.', '70 $', 'products/battery-001.jpg', '001', 1, 1, '2026-09-05 07:20:28', '2026-09-09 09:56:09'),
(2, 1, 'Batterie automobile 24V', '24V Automotive Battery', 'Batterie adaptée aux véhicules professionnels et poids lourds.', 'Battery suitable for professional and heavy-duty vehicles.', '120 $', 'products/battery-002.jpg', '002', 2, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(3, 1, 'Batterie haute performance', 'High-Performance Battery', 'Batterie fiable adaptée aux besoins des véhicules professionnels.', 'Reliable battery suitable for professional vehicle needs.', '95 $', 'products/battery-003.jpg', '003', 3, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(4, 2, 'Pneu pour camion', 'Truck Tire', 'Pneu destiné aux véhicules et camions.', 'Tire designed for vehicles and trucks.', '150 $', 'products/tire-001.jpg', '004', 4, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(5, 2, 'Pneu pour camionnette', 'Light Truck Tire', 'Pneu adapté aux camionnettes et véhicules utilitaires.', 'Tire suitable for light trucks and utility vehicles.', '120 $', 'products/tire-002.jpg', '005', 5, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(6, 2, 'Pneu poids lourd', 'Heavy-Duty Truck Tire', 'Pneu adapté aux véhicules lourds et aux besoins professionnels.', 'Tire suitable for heavy-duty vehicles and professional use.', '200 $', 'products/tire-003.jpg', '006', 6, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(7, 3, 'Huile moteur TOTAL 15W40', 'TOTAL 15W40 Engine Oil', 'Huile moteur destinée à l’entretien des véhicules.', 'Engine oil designed for vehicle maintenance.', '28 $', 'products/oil-001.jpg', '007', 7, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(8, 3, 'Huile moteur TOTAL 20W50', 'TOTAL 20W50 Engine Oil', 'Huile moteur pour différents types de véhicules.', 'Engine oil for different types of vehicles.', '32 $', 'products/oil-002.jpg', '008', 8, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(9, 3, 'Lubrifiant automobile TOTAL', 'TOTAL Automotive Lubricant', 'Lubrifiant destiné aux besoins d’entretien automobile.', 'Lubricant designed for automotive maintenance needs.', '36 $', 'products/oil-003.jpg', '009', 9, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(10, 4, 'Filtre à huile', 'Oil Filter', 'Filtre destiné au système de lubrification du moteur.', 'Filter designed for the engine lubrication system.', '12 $', 'products/filter-oil-001.jpg', '010', 10, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(11, 4, 'Filtre à air', 'Air Filter', 'Filtre destiné à la filtration de l’air du moteur.', 'Filter designed to clean the air entering the engine.', '10 $', 'products/filter-air-001.jpg', '011', 11, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(12, 4, 'Filtre à carburant', 'Fuel Filter', 'Filtre destiné à la filtration du carburant.', 'Filter designed to clean the fuel.', '14 $', 'products/filter-fuel-001.jpg', '012', 12, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:23'),
(13, 4, 'Plaquettes de frein', 'Brake Pads', 'Pièces de freinage destinées aux véhicules automobiles.', 'Braking components designed for automotive vehicles.', '40 $', 'products/brake-pads-001.jpg', '013', 13, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:24'),
(14, 4, 'Disques de frein', 'Brake Discs', 'Composants du système de freinage automobile.', 'Components of an automotive braking system.', '55 $', 'products/brake-discs-001.jpg', '014', 14, 1, '2026-09-05 07:20:28', '2026-09-08 11:07:24');

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `name_fr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_categories`
--

INSERT INTO `product_categories` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `name_fr`, `name_en`, `description_fr`, `description_en`, `image`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Des produits automobiles de qualité', 'Quality Automotive Products', 'Batteries, pneus, lubrifiants et pièces détachées', 'Batteries, tires, lubricants and spare parts', 'Batteries', 'Batteries', 'Batteries automobiles pour différents types de véhicules.', 'Automotive batteries for different types of vehicles.', 'categories/batteries.jpg', 1, 1, '2026-09-05 07:20:28', '2026-09-09 09:15:28'),
(2, 'Des produits automobiles de qualité', 'Quality Automotive Products', 'Batteries, pneus, lubrifiants et pièces détachées', 'Batteries, tires, lubricants and spare parts', 'Pneus', 'Tires', 'Pneus adaptés aux voitures, camionnettes et véhicules lourds.', 'Tires suitable for cars, light trucks and heavy-duty vehicles.', 'categories/tires.jpg', 2, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(3, 'Des produits automobiles de qualité', 'Quality Automotive Products', 'Batteries, pneus, lubrifiants et pièces détachées', 'Batteries, tires, lubricants and spare parts', 'Lubrifiants', 'Lubricants', 'Lubrifiants et huiles moteur pour différents types de véhicules.', 'Lubricants and motor oils for different types of vehicles.', 'categories/lubricants.jpg', 3, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50'),
(4, 'Des produits automobiles de qualité', 'Quality Automotive Products', 'Batteries, pneus, lubrifiants et pièces détachées', 'Batteries, tires, lubricants and spare parts', 'Pièces détachées', 'Spare Parts', 'Pièces et composants automobiles pour différents besoins.', 'Automotive parts and components for different needs.', 'categories/spare-parts.jpg', 4, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `name_fr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `name_fr`, `name_en`, `description_fr`, `description_en`, `icon`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Importation de pièces automobiles', 'Automotive Parts Importation', 'Importation de pièces et équipements automobiles de qualité.', 'Importation of quality automotive parts and equipment.', 'bi-car-front', 1, 1, '2026-09-05 07:20:28', '2026-09-09 08:40:09'),
(2, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Pneus pour véhicules et camions', 'Tires for Vehicles and Trucks', 'Fourniture de pneus adaptés aux différents types de véhicules.', 'Supply of tires suitable for different types of vehicles.', 'bi-circle', 2, 1, '2026-09-05 07:20:28', '2026-09-08 13:10:22'),
(3, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Batteries automobiles', 'Automotive Batteries', 'Vente de batteries fiables pour voitures et véhicules professionnels.', 'Sale of reliable batteries for cars and professional vehicles.', 'bi-battery-full', 3, 1, '2026-09-05 07:20:28', '2026-09-08 13:10:22'),
(4, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Lubrifiants et huiles moteur', 'Lubricants and Motor Oils', 'Distribution de lubrifiants et huiles moteur TOTAL.', 'Distribution of TOTAL lubricants and motor oils.', 'bi-droplet', 4, 1, '2026-09-05 07:20:28', '2026-09-08 13:10:22'),
(5, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Vente en gros', 'Wholesale', 'Fourniture de produits automobiles aux magasins, revendeurs et professionnels.', 'Supply of automotive products to stores, resellers and professionals.', 'bi-box-seam', 5, 1, '2026-09-05 07:20:28', '2026-09-08 13:10:22'),
(6, 'Des solutions automobiles adaptées à vos besoins', 'Automotive Solutions Tailored to Your Needs', 'Une gamme de services pour les particuliers et les professionnels', 'A range of services for individuals and professionals', 'Distribution en Côte d’Ivoire', 'Distribution in Côte d’Ivoire', 'Distribution de nos produits dans différentes régions de la Côte d’Ivoire.', 'Distribution of our products across different regions of Côte d’Ivoire.', 'bi-truck', 6, 1, '2026-09-05 07:20:28', '2026-09-08 13:10:22');

-- --------------------------------------------------------

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=MyISAM AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `site_settings`
--

INSERT INTO `site_settings` (`id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
(1, 'default_language', 'fr', '2026-09-05 07:20:28', '2026-09-05 07:20:28'),
(2, 'company_location', 'San Pedro, Côte d’Ivoire', '2026-09-05 07:20:28', '2026-09-05 07:20:28'),
(3, 'delivery_available', '1', '2026-09-05 07:20:28', '2026-09-05 07:20:28'),
(4, 'site_title', 'AUTO MOTORS SARL', '2026-09-05 12:55:50', '2026-09-05 12:55:50'),
(5, 'contact_title_fr', 'Contactez-nous', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(6, 'contact_title_en', 'Contact Us', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(7, 'contact_subtitle_fr', 'Notre équipe est à votre disposition pour répondre à vos besoins.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(8, 'contact_subtitle_en', 'Our team is available to help with your automotive needs.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(9, 'contact_intro_title_fr', 'Parlons de vos besoins', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(10, 'contact_intro_title_en', 'Let\'s discuss your needs', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(11, 'contact_info_title_fr', 'Besoin d\'informations ?', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(12, 'contact_info_title_en', 'Need more information?', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(13, 'contact_info_description_fr', 'Contactez-nous directement pour connaître la disponibilité de nos produits et obtenir plus d\'informations.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(14, 'contact_info_description_en', 'Contact us directly to check product availability and get more information.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(15, 'contact_call_button_fr', 'Nous appeler', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(16, 'contact_call_button_en', 'Call us', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(17, 'contact_delivery_title_fr', 'Distribution disponible', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(18, 'contact_delivery_title_en', 'Delivery available', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(19, 'contact_delivery_description_fr', 'Nous assurons la distribution selon les besoins de nos clients.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(20, 'contact_delivery_description_en', 'We provide distribution according to our clients\' needs.', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(21, 'contact_follow_title_fr', 'Suivez-nous', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(22, 'contact_follow_title_en', 'Follow Us', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(23, 'contact_phone_label_fr', 'Téléphone', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(24, 'contact_phone_label_en', 'Phone', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(25, 'contact_email_label_fr', 'Email', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(26, 'contact_email_label_en', 'Email', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(27, 'contact_address_label_fr', 'Adresse', '2026-09-05 13:39:27', '2026-09-05 13:39:27'),
(28, 'contact_address_label_en', 'Address', '2026-09-05 13:39:27', '2026-09-05 13:39:27');

-- --------------------------------------------------------

--
-- Table structure for table `social_links`
--

DROP TABLE IF EXISTS `social_links`;
CREATE TABLE IF NOT EXISTS `social_links` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `platform` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_links`
--

INSERT INTO `social_links` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `platform`, `url`, `icon`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Suivez-nous', 'Follow Us', 'Restez connectés avec AUTO MOTORS SARL', 'Stay connected with AUTO MOTORS SARL', 'Facebook', 'https://facebook.com/auto-motors-demo', 'bi-facebook', 1, 1, '2026-09-05 07:20:28', '2026-09-09 10:12:26'),
(2, 'Suivez-nous', 'Follow Us', 'Restez connectés avec AUTO MOTORS SARL', 'Stay connected with AUTO MOTORS SARL', 'Instagram', 'https://instagram.com/auto_motors_demo', 'bi-instagram', 2, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:52'),
(3, 'Suivez-nous', 'Follow Us', 'Restez connectés avec AUTO MOTORS SARL', 'Stay connected with AUTO MOTORS SARL', 'WhatsApp', 'https://wa.me/2250749616161', 'bi-whatsapp', 3, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:52'),
(4, 'Suivez-nous', 'Follow Us', 'Restez connectés avec AUTO MOTORS SARL', 'Stay connected with AUTO MOTORS SARL', 'LinkedIn', 'https://linkedin.com/company/auto-motors-demo', 'bi-linkedin', 4, 1, '2026-09-05 07:20:28', '2026-09-08 13:14:52');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `section_title_fr` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_title_en` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `section_subtitle_fr` text COLLATE utf8mb4_unicode_ci,
  `section_subtitle_en` text COLLATE utf8mb4_unicode_ci,
  `type_fr` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_fr` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description_fr` text COLLATE utf8mb4_unicode_ci,
  `description_en` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'bi-truck',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `section_title_fr`, `section_title_en`, `section_subtitle_fr`, `section_subtitle_en`, `type_fr`, `type_en`, `name_fr`, `name_en`, `description_fr`, `description_en`, `image`, `display_order`, `is_active`, `created_at`, `updated_at`, `icon`) VALUES
(1, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Camionnette', 'Light Truck', 'Kia', 'Kia', 'Produits adaptés aux véhicules utilitaires Kia.', 'Products suitable for Kia light commercial vehicles.', 'vehicles/kia.jpg', 1, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(2, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Camionnette', 'Light Truck', 'Hyundai', 'Hyundai', 'Produits adaptés aux véhicules utilitaires Hyundai.', 'Products suitable for Hyundai light commercial vehicles.', 'vehicles/hyundai.jpg', 2, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(3, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Camionnette', 'Light Truck', 'Canter', 'Canter', 'Produits adaptés aux véhicules Canter.', 'Products suitable for Canter vehicles.', 'vehicles/canter.jpg', 3, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(4, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Poids lourds', 'Heavy Duty', 'Mercedes', 'Mercedes', 'Produits adaptés aux véhicules lourds Mercedes.', 'Products suitable for Mercedes heavy-duty vehicles.', 'vehicles/mercedes.jpg', 4, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(5, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Poids lourds', 'Heavy Duty', 'Sinotruk', 'Sinotruk', 'Produits adaptés aux véhicules lourds Sinotruk.', 'Products suitable for Sinotruk heavy-duty vehicles.', 'vehicles/sinotruk.jpg', 5, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(6, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Poids lourds', 'Heavy Duty', 'DAF', 'DAF', 'Produits adaptés aux véhicules lourds DAF.', 'Products suitable for DAF heavy-duty vehicles.', 'vehicles/daf.jpg', 6, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck'),
(7, 'Des solutions pour différents types de véhicules', 'Solutions for Different Types of Vehicles', 'Des produits adaptés aux véhicules légers et poids lourds', 'Products suitable for light and heavy-duty vehicles', 'Poids lourds', 'Heavy Duty', 'Renault', 'Renault', 'Produits adaptés aux véhicules lourds Renault.', 'Products suitable for Renault heavy-duty vehicles.', 'vehicles/renault.jpg', 7, 1, '2026-09-05 07:20:28', '2026-09-05 12:55:50', 'bi-truck');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
