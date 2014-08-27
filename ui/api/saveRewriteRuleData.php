<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);


$sql_result = $mysqlmanager->query('DELETE FROM `rewrite_rules` WHERE session_id="1"');
if(isset($_POST['rules'])) {
	foreach($_POST['rules'] as $val) {
		$id = $mysqlmanager->sanitize($val['id']);
		$url = $mysqlmanager->sanitize($val['url']);
		$replacement = $mysqlmanager->sanitize($val['replacement']);
		$port = $mysqlmanager->sanitize($val['port']);		
		$header_override = $mysqlmanager->sanitize($val['header_override']);

		$active = $mysqlmanager->sanitize($val['active']);
		$global = $mysqlmanager->sanitize($val['global']);
		$caseinsensitive = $mysqlmanager->sanitize($val['caseinsensitive']);						
		$sql_result = $mysqlmanager->query('INSERT INTO `rewrite_rules` values(null, "1", "' . $id . '", "'. $url .'", "' . $replacement. '", "' . $header_override . '", "' . $port. '",  '. $active .',  '. $global .',  '. $caseinsensitive .' )');
	}
}
echo 'Data saved!';