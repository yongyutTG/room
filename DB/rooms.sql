-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2023 at 05:47 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `roomdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `room_id` varchar(50) NOT NULL,
  `room_type` varchar(250) NOT NULL,
  `bed_type` varchar(250) NOT NULL,
  `roomview` varchar(250) NOT NULL,
  `special_options` text NOT NULL,
  `detail` longtext NOT NULL,
  `data_price` text NOT NULL,
  `example_room` text NOT NULL,
  `max_people` int(11) NOT NULL,
  `toilet_count` int(11) NOT NULL,
  `damage` double NOT NULL,
  `price_over_people` double NOT NULL,
  `price_over_minutes` double NOT NULL,
  `price_over_hour` double NOT NULL,
  `price_over_day` double NOT NULL,
  `price_over_week` double NOT NULL,
  `price_over_month` double NOT NULL,
  `price_over_year` double NOT NULL,
  `room_sub` longtext NOT NULL,
  `created` varchar(24) NOT NULL,
  `modified` varchar(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`room_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
