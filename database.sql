-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Апр 01 2025 г., 16:43
-- Версия сервера: 5.7.44-48
-- Версия PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `u2094182_default`
--

-- --------------------------------------------------------

--
-- Структура таблицы `actions`
--

CREATE TABLE `actions` (
  `actionId` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `gdps` tinyint(1) DEFAULT NULL,
  `user` tinyint(1) DEFAULT NULL,
  `author` int(11) NOT NULL,
  `timestamp` bigint(20) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Структура таблицы `alarms`
--

CREATE TABLE `alarms` (
  `ID` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `text` varchar(3000) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `adminName` varchar(255) NOT NULL,
  `adminId` int(11) NOT NULL,
  `public` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `chat`
--

CREATE TABLE `chat` (
  `ID` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(63) NOT NULL,
  `text` mediumtext NOT NULL,
  `date` int(11) NOT NULL,
  `editCount` int(11) NOT NULL,
  `channel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `ID` int(11) NOT NULL,
  `text` varchar(2000) NOT NULL,
  `whereIz` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT '0',
  `channel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `demonlist_demons`
--

CREATE TABLE `demonlist_demons` (
  `ID` int(11) NOT NULL,
  `title` mediumtext NOT NULL,
  `link` mediumtext NOT NULL,
  `listId` int(11) NOT NULL,
  `toppos` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `demonlist_gdpses`
--

CREATE TABLE `demonlist_gdpses` (
  `ID` int(11) NOT NULL,
  `title` mediumtext NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `activated` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `demonlist_records`
--

CREATE TABLE `demonlist_records` (
  `ID` int(11) NOT NULL,
  `levelId` int(11) NOT NULL,
  `gdUserId` int(11) NOT NULL,
  `gdNickname` varchar(255) NOT NULL,
  `progress` varchar(255) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `gdpses`
--

CREATE TABLE `gdpses` (
  `ID` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `database` varchar(255) COLLATE utf8_bin NOT NULL,
  `link` varchar(255) COLLATE utf8_bin NOT NULL,
  `img` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` text COLLATE utf8_bin NOT NULL,
  `author` int(11) DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_bin NOT NULL,
  `tags` tinytext COLLATE utf8_bin NOT NULL,
  `os` tinytext COLLATE utf8_bin NOT NULL,
  `checked` tinyint(1) NOT NULL DEFAULT '0',
  `editCount` int(11) NOT NULL,
  `likes` int(11) NOT NULL DEFAULT '0',
  `status` int(11) NOT NULL,
  `sstatus` tinyint(4) NOT NULL,
  `toppos` int(11) NOT NULL,
  `freejoin` tinyint(4) NOT NULL,
  `points` int(11) NOT NULL,
  `CC` tinyint(4) NOT NULL,
  `MC` tinyint(4) NOT NULL,
  `language` varchar(31) COLLATE utf8_bin NOT NULL DEFAULT 'RU',
  `levelsCount` int(11) NOT NULL,
  `usersCount` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Структура таблицы `gdpsstats`
--

CREATE TABLE `gdpsstats` (
  `ID` int(11) NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `levels` int(11) NOT NULL,
  `accounts` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `guides`
--

CREATE TABLE `guides` (
  `ID` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `aftertext` varchar(255) NOT NULL,
  `img` text NOT NULL,
  `guidetext` longtext NOT NULL,
  `language` varchar(16) NOT NULL DEFAULT 'Ru',
  `checked` tinyint(4) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `joinlog`
--

CREATE TABLE `joinlog` (
  `ID` int(11) NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `joinDate` int(11) NOT NULL,
  `joinData` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `likes`
--

CREATE TABLE `likes` (
  `ID` int(11) NOT NULL,
  `whereIz` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `channel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `logger`
--

CREATE TABLE `logger` (
  `ID` int(11) NOT NULL,
  `SQLquery` varchar(4095) NOT NULL,
  `time` int(11) NOT NULL,
  `ip` varchar(127) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `messages`
--

CREATE TABLE `messages` (
  `ID` int(11) NOT NULL,
  `text` varchar(2000) NOT NULL,
  `whereIz` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` varchar(31) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `news`
--

CREATE TABLE `news` (
  `ID` int(11) NOT NULL,
  `text` varchar(8000) NOT NULL,
  `title` varchar(300) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `date` int(11) NOT NULL,
  `likes` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `points`
--

CREATE TABLE `points` (
  `pointId` int(11) NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `date` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `posts`
--

CREATE TABLE `posts` (
  `gdpsId` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `database` varchar(255) COLLATE utf8_bin NOT NULL,
  `img` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` text COLLATE utf8_bin NOT NULL,
  `author` int(11) DEFAULT NULL,
  `tags` tinytext COLLATE utf8_bin NOT NULL,
  `os` tinytext COLLATE utf8_bin NOT NULL,
  `checked` tinyint(1) NOT NULL DEFAULT '0',
  `likes` int(11) NOT NULL DEFAULT '0',
  `date` varchar(31) COLLATE utf8_bin NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Структура таблицы `soowners`
--

CREATE TABLE `soowners` (
  `ID` int(11) NOT NULL,
  `gdpsId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `channel` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Структура таблицы `texures`
--

CREATE TABLE `texures` (
  `ID` int(11) NOT NULL,
  `title` varchar(255) COLLATE utf8_bin NOT NULL,
  `database` varchar(255) COLLATE utf8_bin NOT NULL,
  `link` varchar(255) COLLATE utf8_bin NOT NULL,
  `img` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` text COLLATE utf8_bin NOT NULL,
  `author` int(11) DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_bin NOT NULL,
  `tags` tinytext COLLATE utf8_bin NOT NULL,
  `os` tinytext COLLATE utf8_bin NOT NULL,
  `checked` tinyint(1) NOT NULL DEFAULT '0',
  `likes` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `mail` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `activated` int(2) NOT NULL DEFAULT '1',
  `code` bigint(20) NOT NULL,
  `priority` tinyint(4) NOT NULL,
  `token` varchar(128) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `actions`
--
ALTER TABLE `actions`
  ADD PRIMARY KEY (`actionId`);

--
-- Индексы таблицы `alarms`
--
ALTER TABLE `alarms`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `demonlist_demons`
--
ALTER TABLE `demonlist_demons`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `demonlist_gdpses`
--
ALTER TABLE `demonlist_gdpses`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `demonlist_records`
--
ALTER TABLE `demonlist_records`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `gdpses`
--
ALTER TABLE `gdpses`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `gdpsstats`
--
ALTER TABLE `gdpsstats`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `guides`
--
ALTER TABLE `guides`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `joinlog`
--
ALTER TABLE `joinlog`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `logger`
--
ALTER TABLE `logger`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `points`
--
ALTER TABLE `points`
  ADD PRIMARY KEY (`pointId`);

--
-- Индексы таблицы `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`gdpsId`);

--
-- Индексы таблицы `soowners`
--
ALTER TABLE `soowners`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `texures`
--
ALTER TABLE `texures`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `actions`
--
ALTER TABLE `actions`
  MODIFY `actionId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `alarms`
--
ALTER TABLE `alarms`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `chat`
--
ALTER TABLE `chat`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `demonlist_demons`
--
ALTER TABLE `demonlist_demons`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `demonlist_gdpses`
--
ALTER TABLE `demonlist_gdpses`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `demonlist_records`
--
ALTER TABLE `demonlist_records`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `gdpses`
--
ALTER TABLE `gdpses`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `gdpsstats`
--
ALTER TABLE `gdpsstats`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `guides`
--
ALTER TABLE `guides`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `joinlog`
--
ALTER TABLE `joinlog`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `likes`
--
ALTER TABLE `likes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `news`
--
ALTER TABLE `news`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `points`
--
ALTER TABLE `points`
  MODIFY `pointId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `posts`
--
ALTER TABLE `posts`
  MODIFY `gdpsId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `soowners`
--
ALTER TABLE `soowners`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `texures`
--
ALTER TABLE `texures`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
