DROP DATABASE IF EXISTS localproxy;

CREATE DATABASE localproxy;

USE DATABASE localproxy;




-- Create syntax for TABLE 'external_proxies'
CREATE TABLE `external_proxies` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `host` char(200) DEFAULT NULL,
  `port` int(11) DEFAULT NULL,
  `url_pattern` varchar(500) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `global` tinyint(1) DEFAULT NULL,
  `caseinsensitive` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'network'
CREATE TABLE `network` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `result_header` text,
  `result_text` blob,
  `loadtime` float DEFAULT NULL,
  `statuscode` char(200) DEFAULT NULL,
  `length` int(11) DEFAULT NULL,
  `stat_search` int(1) DEFAULT NULL,
  `stat_redirect` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5427 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'rewrite_rules'
CREATE TABLE `rewrite_rules` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `index` int(11) DEFAULT NULL,
  `url` varchar(2000) DEFAULT NULL,
  `replacement` varchar(2000) DEFAULT NULL,
  `header_override` longtext,
  `port` int(11) DEFAULT '80',
  `active` tinyint(1) DEFAULT NULL,
  `global` tinyint(1) DEFAULT NULL,
  `caseinsensitive` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'settings'
CREATE TABLE `settings` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `name` char(100) DEFAULT NULL,
  `val` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=latin1;

-- Create syntax for TABLE 'source_replacements'
CREATE TABLE `source_replacements` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `index` int(11) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `find` varchar(2000) DEFAULT NULL,
  `replace` varchar(2000) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `global` tinyint(1) DEFAULT NULL,
  `caseinsensitive` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;



INSERT INTO `settings` (`id`, `session_id`, `name`, `val`)
VALUES
  (60, 1, 'session_record', '1'),
  (61, 1, 'statistic_searchTerm', ''),
  (62, 1, 'proxy_prefix', 'dproxy:');
