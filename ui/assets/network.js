var networkData = {};
var networkOrder = { colon:'' , order: 'asc'};
var netActiveRowIndex = 0;

/**
 *
 */
function addNewSession() {
	$.ajax({
		  url: "api/addNewSession.php",
		  beforeSend: function( xhr ) {
		    //xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		  }
		})
		  .done(function( data ) {
			  //alert(data);
		  });
}


/**
 *
 */
function recordButtonPushed() {
	if(Settings['session_record'] == '1') {
		Settings['session_record'] = 0;
		$('#network_tab #record_btn').addClass('record_btn_inactive');
	}
	else {
		Settings['session_record'] = 1;
		$('#network_tab #record_btn').removeClass('record_btn_inactive');
	}
	saveSettings();
}

/**
 *
 */
function readSessionData() {
	coverDiv(true, null);
	$.ajax({
		  url: "api/readSessionData.php",
		})
		  .done(function( data ) {

			  networkData = jQuery.parseJSON( data );
			  //console.log(networkData);
			  if(networkData.length > config.app.max_net_records) {
				  alert('Reached maximum records amount! Please Empty the net console!');
			  }
			  showSessionData();
		  });
}

function showSessionData() {
	htmlText = '';
	for(var c in networkData) {
		var url = networkData[c].url;
		var loadtime = networkData[c].loadtime;
		var stat_search = networkData[c].stat_search==1 ? 'yes' : '';
		var stat_redirect = networkData[c].stat_redirect != '' ? networkData[c].stat_redirect : '';		
		// extract the statuscode
		var statuscodeText = networkData[c].statuscode;
		var statuscode = statuscodeText.split(' ');
		statuscode = statuscode.length > 0 ? statuscode[0] : '';

		var length = networkData[c].length;
		// extract the domain only
		var domain_only = url.replace(/http:\/\//, '');
		domain_only = domain_only.split('/')[0];
		var tmp = c % 2;
		var className = tmp == 0 ? 'table_odd_row ' : 'table_even_row ';
		// colorize depending of the status code
		className = className + 'net_row_statuscode_' + statuscode + ' ';

		htmlText += '<tr class="' + className + 'net_row" data-id="' + c + '">' +
					'	<td class="domain" data-domain="' + domain_only + '" title="' + url + ' (double-click to copy)" data-full_url="' + url + '">' + domain_only  + '</td>' +
					'	<td class="status" title="' + statuscodeText +'">' + statuscode + '</td>' +
					'	<td class="loadtime">' + loadtime  + '</td>' +
					'	<td class="loadtime">' + length  + '</td>' +
					'	<td class="stat_search">' + stat_search  + '</td>' +					
					'	<td class="stat_redirect" title="' + stat_redirect + '">' + (stat_redirect!= '' ? 'yes' : '')  + '</td>' +					
					'</tr>';
	}

	$("#network_tab_list_body").html(htmlText);

	// Attach mouse events
	$("#network_tab_list tr").click(function() {
		// show the whole url in the table field
		var url = $(this).find('.domain').attr('data-full_url');
		$(this).find('.domain').html(url);
		// show the details
		var id = $(this).attr('data-id');
		showNetworkLinkDetails(id);
	});

	$("#network_tab_list tr").dblclick(function() {
		// coly the whole url
		//var url = $(this).find('.domain').attr('data-full_url');
		selectText($(this));
	});

	$("#network_tab_list tr").mouseover(function() {
		//var url = $(this).find('.domain').attr('data-full_url');
		//$(this).find('.domain').html(url);
	});

	$("#network_tab_list tr").mouseout(function() {
		var domain = $(this).find('.domain').attr('data-domain');
		$(this).find('.domain').html(domain);
	});

	vcNetTable.resizeHeaders();
	coverDiv(false, null);
}

/**
*
*/
function clearSessionData() {
	$.ajax({
		  url: "api/clearSessionData.php",
		})
		  .done(function( data ) {
			  $('#network_tab_list_body').html('');
			  readSessionData();
		  });
}

function showNetworkLinkDetails(id) {
	if(!id)
		return;
	netActiveRowIndex = id;
	$("#net_inspect_headers").html(textToDivText(networkData[id].result_header));
	$('#net_inspect_response_raw').html(textToDivText(networkData[id].result_text));
	$('#net_inspect_response_html').html(textToDivText(networkData[id].result_text));
	// load the preview if preview tab is active
	// !!! The preview sometimes loads a crappy JS that causes the whole browser to hang,
	// that's why I'm doing lazy load only if the preview tab is active. At least the browser will crach
	// only at that time and not while scrolling the net table.
	if(netNavTabActive == 4)
		showNetworkLinkPreview(id);
	// colorize the HTML tab
	motleycolorize.init($('#net_inspect_response_html'));
	motleycolorize.colorise();
	// colorize the HEADER tab
	motleycolorize.init($('#net_inspect_headers'));
	motleycolorize.colorise();
}

function showNetworkLinkPreview(id) {
	if(!id)
		return;
	$('#preview_iframe').attr('src', networkData[id].url);
}
/**
 * Sorts the net table, based on header click
 * @param colonName - sorting colon name from DB->network
 */
function netTableHeadClicked_SortResult(colonName) {
	if(!colonName)
		return;
	// switch ascending/descending or ascending for new column click
	if(networkOrder.colon == colonName) {
		networkOrder.order = networkOrder.order == 'asc' ? 'desc' : 'asc';
	}
	else {
		networkOrder.order = 'asc';
		networkOrder.colon = colonName;
	}
	// sort the array
	networkData.sort(function(a,b) {

		if(colonName == 'url' || colonName == 'statuscode') {
		  	// sorting by string value
			var upA = eval('a.' + colonName + '.toUpperCase()');
			var upB = eval('b.' + colonName + '.toUpperCase()');
			if(networkOrder.order == 'asc')
				return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
			else
				return (upA > upB) ? -1 : (upA < upB) ? 1 : 0;
		}
		else {
			// sort by float value
			if(networkOrder.order == 'asc')
				return eval('a.' + colonName +' - b.' + colonName);
			else
				return eval('b.' + colonName +' - a.' + colonName);
		}
	});
	// reload the view
	showSessionData();
}

/**
 *
 */
function net_clearSortOrder() {
	networkOrder.order = '';
	// sort the array
	networkData.sort(function(a,b) {
		return a.id > b.id;
	});
	// reload the view
	showSessionData();
}
