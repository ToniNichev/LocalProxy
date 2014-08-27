/**
 * adds a rewrite rule box and sets upt the parameters
 *
 * @param host
 * @param replacement
 * @param header_override
 * @param active
 * @param global
 * @param caseinsensitive
 */
function addProxyRule(host, port, url_pattern, active, global, caseinsensitive) {

	// uuid for the panels
	var c = new Date().getTime();
	// clean up some parameters
	url_pattern = url_pattern != '' ? url_pattern.split("\n").join("<br>") : '';
	// draw the rewrite rule
	//var htmlText = $('#external_proxy_list').html();
	var htmlText = '<div class="proxy_rule_boxes fly_box" id="external_proxy_box_id_' + c + '">' + $('#external_proxy_template').html() + '</div>';
	// add the rewrite rule box
	$('#external_proxy_list').append(htmlText);

	// set up the parameters
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .host').html(host);
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .port').html(port);
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .url_pattern').html(url_pattern);

	// checkboxes
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .active').prop('checked', parseInt(active));
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .global').prop('checked', parseInt(global));
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .caseinsensitive').prop('checked', parseInt(caseinsensitive));

	// attach the close button action
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .head a').click(
			function() {
				deleteProxyPanel(c);
			}
	);

	// set active/inactive background on creation
	if(active!='1')
		$('#external_proxy_list #external_proxy_box_id_' + c).addClass('box_inactive');

	// attach active/inactive action
	$('#external_proxy_list #external_proxy_box_id_' + c + ' .active').click(function() {
		if($(this).prop('checked'))
			$('#external_proxy_list #external_proxy_box_id_' + c).removeClass('box_inactive');
		else
			$('#external_proxy_list #external_proxy_box_id_' + c).addClass('box_inactive');
	});	

	// make the pop-out animation effect
	window.setTimeout( function() { $('#external_proxy_box_id_' + c).addClass('fly_box-zoomed');} , 100);
	//$('.external_proxy_box_id_' + c).addClass('fly_box');
}

/**
 *
 * @param id
 */

function deleteProxyPanel(id) {
	$('#external_proxy_box_id_' + id).removeClass('fly_box-zoomed')
	var domObj = $("#external_proxy_box_id_" + id)[0];
	window.setTimeout(function() {
		domObj.outerHTML = "";
	}, 430);
}


/**
 *
 */
function clearProxyRule() {
	$.ajax({
		  url: "api/clearRewriteRule.php",
		})
		  .done(function( data ) {
			  $('#external_proxy_list').html('');
			  loadRewriteRule();
		  });
}

/**
 *
 */
function loadProxyRule() {
	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/loadProxyRuleData.php',
		  data: {sessionId: 1},
		  dataType: "text",
		  success: function(returnData) {
		      proxyRules = jQuery.parseJSON( returnData );
		      for(var c in proxyRules) {
		    	  addProxyRule(  proxyRules[c].host,
		        		  		 proxyRules[c].port,
		        		  		 proxyRules[c].url_pattern,
		                         proxyRules[c].active,
		                         proxyRules[c].global,
		                         proxyRules[c].caseinsensitive		        		  		 
		          );
		      }
		  }
		});
}


/**
 * Saves the rewrite rules into the DB
 */
function saveProxyRule() {
	var rules = {};
	var co = 0;
	$("#external_proxy_list .proxy_rule_boxes").each(function() {
		var host = $(this).find('.host').text();
		var port = $(this).find('.port').text();
		var url_pattern = $(this).find('.url_pattern').html();

		var active = $(this).find('.active').prop('checked');
		var global = $(this).find('.global').prop('checked');
		var caseinsensitive = $(this).find('.caseinsensitive').prop('checked');

		// clean up some parameters
		url_pattern = url_pattern !='' ? url_pattern.replace(/<br\/?\s?>/gi, "\n") : '';
		// prepare the object
		rules[co] = {id: co, host:host, port: port, url_pattern: url_pattern, active: active, global:global, caseinsensitive:caseinsensitive }
		co++;
	});

	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/saveProxyRuleData.php',
		  //data: JSON.stringify(rules),
		  data: {sessionId: 1, rules: rules},
		  dataType: "text",
		  success: function(returnData) { alert(returnData) }
		});
}
