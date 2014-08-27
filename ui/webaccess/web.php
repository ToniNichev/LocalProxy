<?php

//die("!");



?>

<html>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>

<head>

<style>

#ifr {
	width:1000px;
	height: 800px;
}		

</style>

<script>

function go() {
	var request_url = $('#url').val();
	var url = "iframe.php?url=" + encodeURIComponent(request_url)

	$('#ifr').attr('src', url);
}

</script>

</head>


<body>

url:<input id="url" type="text"><button onclick="go();">go</button>
<br>
<iframe id="ifr" src="iframe.php"></iframe>

</body>
</html>