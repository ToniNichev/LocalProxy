<?php
require_once ('../../config/app.php');
require_once('../../dependencies/Util_MysqlWrapper.php');

$mysqlmanager = Util_MysqlWrapper::getInstance();
$mysqlmanager->connect( $config->db->host,
		$config->db->user,
		$config->db->pass,
		$config->db->dbname,
		$config->db->port);


//print_r($_POST['settings']);die;
$sql_result = $mysqlmanager->query('DELETE FROM `settings` WHERE session_id="1"');


if(isset($_POST['settings'])) {
	foreach($_POST['settings'] as $key => $val) {
		$key = $mysqlmanager->sanitize($key);
		$val = $mysqlmanager->sanitize($val);

		$sql_result = $mysqlmanager->query('INSERT INTO `settings` values(null, "1", "' . $key . '", "'. $val .'" )');
	}
}
echo 'Data saved!';