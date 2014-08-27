<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);

$sql_result = $mysqlmanager->query("SELECT * FROM `network` WHERE session_id='1' LIMIT 3001");

$co = 0;
foreach($sql_result as $r) {
	// wrapping the response in 'utf8_encode' otherwise special characters break json_encode
	$sql_result[$co]['result_text'] =  utf8_encode($sql_result[$co]['result_text']);
	$co ++;
}

$result = json_encode($sql_result);
//print_r($result);die;

echo $result;
