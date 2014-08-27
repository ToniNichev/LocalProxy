<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);


$sql_result = $mysqlmanager->query('DELETE FROM `external_proxies` WHERE session_id="1"');

if(isset($_POST['rules'])) {
	foreach($_POST['rules'] as $val) {
		$id = $mysqlmanager->sanitize($val['id']);
		$host = $mysqlmanager->sanitize($val['host']);
		$port = $mysqlmanager->sanitize($val['port']);
		$url_pattern = $mysqlmanager->sanitize($val['url_pattern']);

		$active = $mysqlmanager->sanitize($val['active']);
		$global = $mysqlmanager->sanitize($val['global']);
		$caseinsensitive = $mysqlmanager->sanitize($val['caseinsensitive']);						
		
		$sql_result = $mysqlmanager->query('INSERT INTO `external_proxies` values(null, "1", "' . $host . '", "'. $port .'", "' . $url_pattern. '",  '. $active .',  '. $global .',  '. $caseinsensitive .' )');
	}
}
echo 'Data saved!';