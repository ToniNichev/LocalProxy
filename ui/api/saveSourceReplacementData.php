<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);


$sql_result = $mysqlmanager->query('DELETE FROM `source_replacements` WHERE session_id="1"');
if(isset($_POST['rules'])) {
	foreach($_POST['rules'] as $val) {
		$url = $mysqlmanager->sanitize($val['url']);		
		$id = $mysqlmanager->sanitize($val['id']);
		$find = $mysqlmanager->sanitize($val['find']);
		$replace = $mysqlmanager->sanitize($val['replace']);

		$active = $mysqlmanager->sanitize($val['active']);
		$global = $mysqlmanager->sanitize($val['global']);
		$caseinsensitive = $mysqlmanager->sanitize($val['caseinsensitive']);						

	
		$sql_result = $mysqlmanager->query('INSERT INTO `source_replacements` values(null, "1", "' . $id . '", "' . $url .  '",   "'. $find .'", "' . $replace. '",  '. $active .',  '. $global .',  '. $caseinsensitive .' )');
	}
}
echo 'Data saved!';