<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);


$sql_result = $mysqlmanager->query('SELECT * FROM `external_proxies` WHERE session_id="1"');

echo json_encode($sql_result);