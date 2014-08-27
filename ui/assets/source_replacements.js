/**
 * adds source replacement box and sets upt the parameters
 *
 * @param url
 * @param replacement
 * @param header_override
 * @param active
 * @param global
 * @param caseinsensitive
 */
function addSourceReplacement(url, find, replace, active, global, caseinsensitive) {
	// uuid for the panels
	var c = new Date().getTime();

	//var htmlText = $('#source_replacements_list').html();
	var htmlText =  '<div class="source_replacements_boxes fly_box" id="source_replacements_box_id_' + c + '">' + $('#source_replacements_template').html() + '</div>';
	// add the rewrite rule box
	$('#source_replacements_list').append(htmlText);
	// set up the parameters
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .url').html(url);
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .find').html(find);
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .replace').html(replace);

	// checkboxes
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .active').prop('checked', parseInt(active));
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .global').prop('checked', parseInt(global));
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .caseinsensitive').prop('checked', parseInt(caseinsensitive));


	// attach the close button action
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .head a').click(
			function() {
				//alert(c)
				deleteSourceReplacementPanel(c);
			}
	);

	// attach active/inactive action
	$('#source_replacements_list #source_replacements_box_id_' + c + ' .active').click(function() {
		if($(this).prop('checked'))
			$('#source_replacements_list #source_replacements_box_id_' + c).removeClass('box_inactive');
		else
			$('#source_replacements_list #source_replacements_box_id_' + c).addClass('box_inactive');
	});

	// make the pop-out animation effect
	window.setTimeout( function() { $('#source_replacements_list #source_replacements_box_id_' + c).addClass('fly_box-zoomed');} , 100);
	//$('.external_proxy_box_id_' + c).addClass('fly_box');
}

/**
 *
 * @param id
 */

function deleteSourceReplacementPanel(id) {
	$('#source_replacements_box_id_' + id).removeClass('fly_box-zoomed')
	var domObj = $("#source_replacements_box_id_" + id)[0];
	window.setTimeout(function() {
		domObj.outerHTML = "";
	}, 430);
}


/**
 *
 */
function clearSourceReplacement() {
	$.ajax({
		  url: "api/clearSourceReplacement.php",
		})
		  .done(function( data ) {
			  $('#source_replacements_list').html('');
			  loadSourceReplacement();
		  });
}

/**
 *
 */
function loadSourceReplacement() {
	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/loadSourceReplacementData.php',
		  //data: JSON.stringify(rules),
		  data: {sessionId: 1},
		  dataType: "text",
		  success: function(returnData) {
		      SourceReplacements = jQuery.parseJSON( returnData );
		      console.log(SourceReplacements);
		      for(var c in SourceReplacements) {
		          addSourceReplacement(
		          				SourceReplacements[c].url,		          	
		          				SourceReplacements[c].find,
		                        SourceReplacements[c].replace,

		                        SourceReplacements[c].active,
		                        SourceReplacements[c].global,
		                        SourceReplacements[c].caseinsensitive);
		      }
		  }
		});
}


/**
 * Saves the rewrite rules into the DB
 */
function saveSourceReplacement() {
	var rules = {};
	var co = 0;
	$("#source_replacements_list .source_replacements_boxes").each(function() {
		var url = $(this).find('.url').text();		
		var find = $(this).find('.find').text();
		var replace = $(this).find('.replace').text();

		var active = $(this).find('.active').prop('checked');
		var global = $(this).find('.global').prop('checked');
		var caseinsensitive = $(this).find('.caseinsensitive').prop('checked');

		// prepare the object
		rules[co] = {id: co, url:url, find:find, replace:replace, active: active, global:global, caseinsensitive:caseinsensitive }
		co++;
	});

	// send the rules
	$.ajax({
		  type: "POST",
		  url: 'api/saveSourceReplacementData.php',
		  //data: JSON.stringify(rules),
		  data: {sessionId: 1, rules: rules},
		  dataType: "text",
		  success: function(returnData) { alert(returnData) }
		});
}
