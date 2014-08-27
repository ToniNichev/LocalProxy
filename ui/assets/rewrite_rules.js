/**
 * adds a rewrite rule box and sets upt the parameters
 *
 * @param url
 * @param replacement
 * @param header_override
 * @param active
 * @param global
 * @param caseinsensitive
 */
function addRewriteRule(url, replacement, port, header_override, active, global, caseinsensitive) {
	// uuid for the panels
	var c = new Date().getTime();
	// clean up some parameters
	header_override = header_override != '' ? header_override.split("\n").join("<br>") : '';
	// draw the rewrite rule
	//var htmlText = $('#rewrite_rules_list').html();
	var htmlText =  '<div class="rewrite_rule_boxes fly_box" id="rewrite_rule_box_id_' + c + '">' + $('#rewrite_rules_template').html() + '</div>';
	// add the rewrite rule box
	$('#rewrite_rules_list').append(htmlText);
	// set up the parameters
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .url').html(url);
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .replacement').html(replacement);
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .port').html(port);	
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .header_override').html(header_override);
	// checkboxes
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .active').prop('checked', parseInt(active));
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .global').prop('checked', parseInt(global));
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .caseinsensitive').prop('checked', parseInt(caseinsensitive));

	// attach the close button action
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .head a').click(
			function() {
				deleteRewriteRulePanel(c);
			}
	);

	// set active/inactive background on creation
	if(active!='1')
		$('#rewrite_rules_list #rewrite_rule_box_id_' + c).addClass('box_inactive');

	// attach active/inactive action
	$('#rewrite_rules_list #rewrite_rule_box_id_' + c + ' .active').click(function() {
		if($(this).prop('checked'))
			$('#rewrite_rules_list #rewrite_rule_box_id_' + c).removeClass('box_inactive');
		else
			$('#rewrite_rules_list #rewrite_rule_box_id_' + c).addClass('box_inactive');
	});

	// make the pop-out animation effect
	window.setTimeout( function() { $('#rewrite_rules_list #rewrite_rule_box_id_' + c).addClass('fly_box-zoomed');} , 100);
	
	sanitizeContenteditableDivs();
}

/**
 *
 * @param id
 */

function deleteRewriteRulePanel(id) {
	$('#rewrite_rule_box_id_' + id).removeClass('fly_box-zoomed')
	var domObj = $("#rewrite_rule_box_id_" + id)[0];
	window.setTimeout(function() {
		domObj.outerHTML = "";
	}, 430);
}


/**
 *
 */
function clearRewriteRule() {
	$.ajax({
		  url: "api/clearRewriteRule.php",
		})
		  .done(function( data ) {
			  $('#rewrite_rules_list').html('');
			  loadRewriteRule();
		  });
}

/**
 *
 */
function loadRewriteRule() {
	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/loadRewriteRuleData.php',
		  //data: JSON.stringify(rules),
		  data: {sessionId: 1},
		  dataType: "text",
		  success: function(returnData) {
		      rewriteRules = jQuery.parseJSON( returnData );
		      console.log(rewriteRules);
		      for(var c in rewriteRules) {
		          addRewriteRule(rewriteRules[c].url,
		                         rewriteRules[c].replacement,
		                         rewriteRules[c].port,		                         
		                         rewriteRules[c].header_override,
		                         rewriteRules[c].active,
		                         rewriteRules[c].global,
		                         rewriteRules[c].caseinsensitive);
		      }
		  }
		});
}


/**
 * Saves the rewrite rules into the DB
 */
function saveRewriteRule() {
	var rules = {};
	var co = 0;
	$("#rewrite_rules_list .rewrite_rule_boxes").each(function() {
		var url = $(this).find('.url').text();
		var replacement = $(this).find('.replacement').text();
		var port = $(this).find('.port').text();		
		var header_override = $(this).find('.header_override').html();

		var active = $(this).find('.active').prop('checked');
		var global = $(this).find('.global').prop('checked');
		var caseinsensitive = $(this).find('.caseinsensitive').prop('checked');
		// clean up some parameters
		header_override = header_override!='' ? header_override.replace(/<br\/?\s?>/gi, "\n") : '';
		// prepare the object
		rules[co] = {id: co, url:url, replacement:replacement,port:port, header_override: header_override, active: active, global:global, caseinsensitive:caseinsensitive}
		co++;
	});

	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/saveRewriteRuleData.php',
		  //data: JSON.stringify(rules),
		  data: {sessionId: 1, rules: rules},
		  dataType: "text",
		  success: function(returnData) { alert(returnData) }
		});
}


function launchRegExor(obj) {
    var box = obj.parent().parent();
    var url = box.find('.url').html();
    var replacement = box.find('.replacement').html();
    var url = "http://regexor.com/?regex=" + url + "&replace=" + replacement + "&teststr=http://w3schools.com/"    	
    // Show the regex tester
    htmlText = '<div class="head"><a class="btn" href="#" onclick="toggleBox(\'big\', false)">x</a></div><iframe src="' + url + '"></iframe> ';
    $('#big_box').html(htmlText);
    toggleBox('big', true);
}