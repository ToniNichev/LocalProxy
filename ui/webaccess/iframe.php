<script>
ondocument
</script>
<?php



require_once ('config/app.php');
require_once('dependencies/CurlWrapper.php');
require_once('dependencies/Util_MysqlWrapper.php');
require_once ('debugProxy.php');

$proxy = new debugProxy($config);


$url = $_REQUEST['url'];

$proxy->proxyTheRequest($url);
?>