<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js?localProxy=1"></script>
<title>Debug Proxy</title>

<script type="text/javascript">
var config = {app: {} };
<?php
require_once('../config/app.php');
// Config params
echo 'config.app.max_net_records='. $config->app->max_net_records . ";\n";
?>

</script>

<script src="dependencies/VCNavTabs.js"></script>
<script src="dependencies/vc_tables.js"></script>
<script src="dependencies/motleyscript/motleycolorize.js"></script>
<script src="assets/network.js"></script>
<script src="assets/main.js"></script>
<script src="assets/rewrite_rules.js"></script>
<script src="assets/source_replacements.js"></script>
<script src="assets/external_proxies.js"></script>
<script src="assets/statistics.js"></script>

<link href="assets/net.css" rel="stylesheet" type="text/css" />
<link href="assets/rewrite_rules.css" rel="stylesheet" type="text/css" />
<link href="assets/source_replacements.css" rel="stylesheet" type="text/css" />
<link href="assets/statistic.css" rel="stylesheet" type="text/css" />
<link href="assets/external_proxies.css" rel="stylesheet" type="text/css" />
<link href="dependencies/motleyscript/motleyscript.css" rel="stylesheet" type="text/css"  />
<link href="assets/main.css" rel="stylesheet" type="text/css" />

</head>

<body>


	<div id="wrapper">

		<div id="top">
			<ul id="VCMainNavTabs" class="VCNavTabs">
				<li class="active"><a href='#' >Network</a></li>
				<li><a href='#' >URL Rewrite Rules</a></li>
				<li><a href='#' >Source Code Replace</a></li>				
				<li><a href='#'>Statistic</a></li>
				<li><a href='#'>External Proxy</a></li>
				<li><a href='#'>About</a></li>
			</ul>
		</div>

		<div id="middle">
			<div class='TabBoxes'>

				<!-- ######### Network Tab ########## -->
				<div id="network_tab">
					<div class="pannel">
						<a href="#" id="record_btn" class="btn" onclick="recordButtonPushed()">Record</a>
						<a href="#" class="btn" onclick="readSessionData()">Reload</a>
						<a href="#" class="btn red_btn" onclick="clearSessionData()">Clear Data</a>
						<a href="#" class="btn" onclick="net_clearSortOrder()">Clear Sort Order</a>
						<a href="#" class="btn" onclick="expandNetDetails()">Toggle Details Area</a>						
					</div>
				<div id="networl_tab_wrapper">
					<div id='network_tab_list'>
						<table>
							<thead>
								<tr>
									<th data-fieldname='url' title='click to sort by domain'>domain</th>
									<th data-fieldname='statuscode' title='click to sort by status'>status</th>
									<th data-fieldname='loadtime' title='click to sort by load time'>load time</th>
									<th data-fieldname='length' title='click to sort by length'>length</th>
									<th data-fieldname='stat_search' title='click to sort by searched term'>search</th>
									<th data-fieldname='stat_redirect' title=''>Redirect</th>									
								</tr>
							</thead>
							<tbody id="network_tab_list_body">

							</tbody>
						</table>
					</div>
					<div class="net_inspect">
						<ul id="VCNetNavTabs" class="VCNavTabs">
							<li class="active"><a href='#' >Headers</a></li>
							<li><a href='#' >Raw</a></li>
							<li><a href='#' >Source Code</a></li>							
							<li><a href='#'>JSON</a></li>
							<li><a href='#'>Preview</a></li>
						</ul>
						<div id="net_inspect_headers"></div>
						<div id="net_inspect_response_raw"></div>						
						<div id="net_inspect_response_html"></div>
						<div id="net_inspect_response_json"></div>
						<div id="net_inspect_response_preview"><iframe id='preview_iframe'></iframe></div>						
					</div>
				</div>
</div>
				<!-- ######################################################## -->
				<!-- ################### Rewrite Rules #################### -->
				<div id="rewrite_rules_holder">
					<div class="pannel">
						<a href='#' class="btn" onclick="addRewriteRule('','', '', '', 1, 1, 1)">+</a>
						<a href='#' class="btn" onclick="clearRewriteRule()">clear</a>
						<a href='#' class="btn" onclick="saveRewriteRule()">save</a>
					</div>

					<div id='rewrite_rules_list' class="boxes">
					</div>

					<!--  ### Hidden template for the rewrite rules pannel ### -->
					<div id='rewrite_rules_template' class="boxes" data-id=''>
						<div class="head">						
							<div class='pannel'>
								<a href='#' class="btn">x</a>
								<input type='checkbox' id='chkbx_regexp_a' class='active'>active
								<input type='checkbox' id='chkbx_regexp_g' class='global'>global
								<input type='checkbox' id='chkbx_regexp_i' class='caseinsensitive'>case insensitive
							</div>
						</div>
						<div class="title txt_labels">Match URL <span class='cl_important cl_small'>(regex pattern)</span>:</div>
						<div contenteditable="true" class="txt_fields url" title='Regular expression to match the url. For example this regex will match everything:  ^.*$'></div>

						<div class="title txt_labels">Replacement:</div>
						<div contenteditable="true" class="txt_fields replacement"></div>

						<div class="title txt_labels">Port:</div>
						<div contenteditable="true" class="txt_fields port" title="The port # which curl should use to make the requests"></div>						

						<div class="title txt_labels">Header Override:<br><br><a href="#" class='btn' onclick="launchRegExor($(this))">test pattern</a></div>
						<div contenteditable="true" class="txt_fields header_override" title="Line separated list of header override parameters, name : value. Example: Host:cnn.com"></div>
					</div>
				</div>
				<!-- ######################################################## -->
				<!-- ################## Source Replacements ################# -->
				<div id="source_replacements_holder">
					<div class="pannel">
						<a href='#' class="btn" onclick="addSourceReplacement('', '', '')">+</a>
						<a href='#' class="btn" onclick="clearSourceReplacement()">clear</a>
						<a href='#' class="btn" onclick="saveSourceReplacement()">save</a>
					</div>

					<div id='source_replacements_list' class="boxes">
					</div>

					<!--  ### Hidden template for the source replacements pannel ### -->
					<div id='source_replacements_template' class="boxes" data-id=''>
						<div class="head">						
							<div class='pannel'>
								<a href='#' class="btn">x</a>
								<input type='checkbox'  class='active'>active
								<input type='checkbox' id='chkbx_regexp_g' class='global'>global
								<input type='checkbox' id='chkbx_regexp_i' class='caseinsensitive'>case insensitive								
							</div>
						</div>

						<div class="title txt_labels">URL <span class='cl_important cl_small'>(regex pattern)</span>:</div>
						<div contenteditable="true" class="txt_fields url" title="URL to apply to"></div>						


						<div class="title txt_labels">Find <span class='cl_important cl_small'>(regex pattern)</span>:</div>
						<div contenteditable="true" class="txt_fields find" title='Regular expression to match the searched criteria. For example this regex will match everything:  ^.*$'></div>


						<div class="title txt_labels">Replacement:</div>
						<div contenteditable="true" class="txt_fields replace"></div>
					</div>
				</div>
				<!-- ######################################################## -->				
				<!-- ################ Statistic Holder ###################### -->

				<div id="statistic_holder">
					<div class="pannel">
						<a href='#' class="btn" onclick="saveStatistics()">save</a>
					</div>


					<div id="statistic_list_holder">						
						<div id='search_text_expression' class="boxes" data-id=''>
							<div class="head">						
								<div class='pannel'>
									<span>
										<b>Proxy Prefix</b>
										<p>
											Add proxy prefix if you want to connect to the debugging proxy without adding a proxy setting in the browser. 
											<br>
											For example if you add: `<span class='red'><b>dproxy:</b></span>` you could tunnel a webpage through the debugging proxy by simply pointing your browser to: http://127.0.0.1:85/dproxy:http://www.cnn.com
											<br>
											Leave the field empty for normal behavior. <span class='red'>NOTE !!! If this is enabled you most probably will see missing files when you have the clasical proxy set up.</span>
										</p></span>							
								</div>
							</div>
							<div class="title txt_labels">prefix</div>
							<div contenteditable="true" id="statistic_proxy_pefix" class="txt_fields" title='Regular expression to match the search term.'></div>
							<div id="list">							
							</div>
						</div>
					</div>

					<div id="statistic_list_holder">						
						<div id='search_text_expression' class="boxes" data-id=''>
							<div class="head">						
								<div class='pannel'>
									<span><b>Search for text expression</b></span>							
									<input type='checkbox' checked id='chkbx_regexp_a'>active
									<br>
									<p>
										Add a search term to search in the loaded files
									</p>
								</div>
							</div>
							<div class="title txt_labels">search for <span class='cl_important cl_small'>(regex pattern)</span>:</div>
							<div contenteditable="true" id="statistic_search_term" class="txt_fields" title='Regular expression to match the search term.'></div>
							<div id="list">							
							</div>
						</div>
					</div>

				</div>
				<!-- ######################################################## -->
				<!-- ############     External Proxy Holder   ############### -->
				<div id="external_proxy_holder">
					<div class="pannel">
						<a href='#' class="btn" onclick="addProxyRule('','', '', '1', '1', '1')">+</a>
						<a href='#' class="btn" onclick="clearProxyRule()">clear</a>
						<a href='#' class="btn" onclick="saveProxyRule()">save</a>
					</div>

					<div id='external_proxy_list' class="boxes">
					</div>

					<!--  ### Hidden template for the rewrite rules pannel ### -->
					<div id='external_proxy_template' class="boxes" data-id=''>						
						<div class='pannel'>
							<div class="head"><a href='#' class="btn">x</a>
								<input type='checkbox' class='active'>active
								<input type='checkbox' class='global'>global
								<input type='checkbox' class='caseinsensitive'>case insensitive
							</div>						
						</div>

						<div class="title txt_labels">Match URL <span class='cl_important cl_small'>(regex pattern)</span>:</div>
						<div contenteditable="true" class="txt_fields url_pattern"></div>

						<div class="title txt_labels">proxy url :</div>
						<div contenteditable="true" class="txt_fields host"></div>

						<div class="title txt_labels">proxy Port:</div>
						<div contenteditable="true" class="txt_fields port"></div>
					</div>
				</div>
				<!-- ######################################################## -->
				<!-- #################       About Tab     ################## -->
				<div id="about_holder">
					...
				</div>

			</div>


			<div id="result_replacement_field" class='component_small'>
				Replacement
			</div>

		</div>

		<div id="bottom">
			Debug Proxy 2.0 written by toni.nichev@gmail.com
		</div>
	</div>


	<div>
	    <!--  ####################################### -->
	    <!--  Fly Box 								  -->
	    <!--  ####################################### -->

		<div id="fly_box" class='boxes fly_box'>
		</div>	
	
	    <!--  ####################################### -->
	    <!--  Big Box 								  -->
	    <!--  ####################################### -->

		<div id="big_box" class='boxes big_box'>
		</div>
	</div>

	<div class="cover_div" id='cover_div'>
		<div class="Absolute-Center">
			<img src='assets/loading.gif'>
		</div>	
	</div>	

</body>
</html>