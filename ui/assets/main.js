var navTabs;
var rg = null; // the regex object
var Settings = {};
var vcNetTable;
var motleycolorize =  null;
var netNavTabActive = 0; // we need to determin which net tab is active so we could 'lazy' load the preview based on that


$(document).ready(function() {
	coverDiv(true, null);
	// Hide boxes
	$('#big_box').css('display', 'none');
	$('#fly_box').css('display', 'none');

	// Main Nav Tabs
	navTabs = new VCNavTabs();
	navTabs.init({targetElement: $('#VCMainNavTabs') ,
				  onTabClick: function(i) {
					  hideAllMainTabs();
					  switch(i) {
					  	case 0:
					  		$("#network_tab").css('display', 'block');
					  		break;
					  	case 1:
					  		$("#rewrite_rules_holder").css('display', 'block');
							break;
					  	case 2:
					  		$("#source_replacements_holder").css('display', 'block');
							break;							
					  	case 3:
					  		$("#statistic_holder").css('display', 'block');
							break;
					  	case 4:
					  		$("#external_proxy_holder").css('display', 'block');
							break;
					  	case 5:
					  		$("#about_holder").css('display', 'block');
							break;

					  }
				  }
		});

	// Net Nav Tabs
	navTabs = new VCNavTabs();
	navTabs.init({targetElement: $('#VCNetNavTabs') ,
				  onTabClick: function(i) {
					  hideAllNavTabs();
					  switch(i) {
					  	case 0:
					  		$("#net_inspect_headers").css('display', 'block');
					  		break;
					  	case 1:
					  		$("#net_inspect_response_raw").css('display', 'block');
							break;
					  	case 2:
					  		$("#net_inspect_response_html").css('display', 'block');
							break;
					  	case 3:
					  		$("#net_inspect_response_json").css('display', 'block');
							break;
					  	case 4:
					  		$("#net_inspect_response_preview").css('display', 'block');
					  		showNetworkLinkPreview(netActiveRowIndex);
							break;

					  }
					  netNavTabActive = i;
				  }
		});

	loadSettings(true);
	$("#net_inspect_headers").css('display', 'block');
	loadRewriteRule();
	loadSourceReplacement();
	readSessionData();
	loadProxyRule();
	// set up net table resize
	vcNetTable = new vc_tables();
	vcNetTable.init('#network_tab_list');

	// make net tab to expand and collapse on mouseover
	//tabExpandInterval = null;
	$(".net_inspect").mouseover(
		    function() {

		        //$(this).css('top', '140px');
		        //$(this).css('height', 'auto');
		    }
		);



	$(".net_inspect").mouseout(
	    function() {
	        //$(this).css('top', '');
	        //$(this).css('height', '185px');
	    }
	);

	// Attach the click events on net tab head
	//$('#network_tab_list .table_head_domain').click(function() {
	//	netTableHeadClicked();
	//});

	// Attach the click events on net tab head
	$('#network_tab_list table thead th').each(function() {

		$(this).click(function() {
			var self = this;
			coverDiv(true, function() {
				netTableHeadClicked_SortResult($(self).attr('data-fieldname'));
				netTableHeadClicked_SortResult(null);
			});
	    });

	    /*
		$(this).click(function() {
	    	netTableHeadClicked_SortResult($(this).attr('data-fieldname'));
	    	netTableHeadClicked_SortResult(null);
	    });
	    */

	});

	// Attach paste events to contenteditable divs to sanitize pasted content (remove the styling)
	sanitizeContenteditableDivs();

	// init the colorization code
	motleycolorize = new MotleyColorize();
});

/**
 *
 *
 */
function expandNetDetails() {
	if($(".net_inspect").css('top') =='auto') {
		$(".net_inspect").css('top', '200px');
		$(".net_inspect").css('height', 'auto');	
	}
	else {
		//$(".net_inspect").css('top', '');
	    
	    $('.net_inspect').css('top', '');
	    $('.net_inspect').css('height', '185px');		
	}
}


/**
 * Sets various things in the GUI
 */
function doSetUpGUI() {
	if(Settings.session_record == '1')
		$('#network_tab #record_btn').removeClass('record_btn_inactive');
	else {
		$('#network_tab #record_btn').addClass('record_btn_inactive');
	}
}


/**
 * Save the settings into DB
 */
function saveSettings() {
	// send the rules

	//console.log(Settings);
	$.ajax({
		  type: "POST",
		  url: 'api/settingsSave.php',
		  data: {sessionId: 1, settings: Settings},
		  dataType: "text",
		  success: function(returnData) {
			  alert('Setting saved!');
		  }
		});
}

/**
 *
 * @param setUpGUI if this is set to true, the function will call doSetUpGUI() to set up the GUI
 */
function loadSettings(setUpGUI) {
	Settings = {};
	$.ajax({
		  url: "api/settingsLoad.php",
		})
		  .done(function( data ) {
			  var settingsData = jQuery.parseJSON( data );
			  //console.log(settingsData);
			  // transform settings object it to associative array for easy access
			  for(var c in settingsData) {
			      var name = settingsData[c].name;
			      var val = settingsData[c].val;
			      //Settings[name] = val;
			      Settings[name] = val;
			  }
			  
			  // Load aditional stuff after statistic is accessible
			  loadStatistics();

			  if(setUpGUI) {
				  doSetUpGUI();
			  }
		  });
}



function hideAllMainTabs() {
	$('#network_tab').css('display', 'none');
	$('#rewrite_rules_holder').css('display', 'none');
	$('#source_replacements_holder').css('display', 'none');
	//$('#header_modifications').css('display', 'none');
	$('#statistic_holder').css('display', 'none');
	$('#external_proxy_holder').css('display', 'none');
	$('#about_holder').css('display', 'none');

}

function hideAllNavTabs() {
	$('#net_inspect_headers').css('display', 'none');
	$('#net_inspect_response_raw').css('display', 'none');
	$('#net_inspect_response_html').css('display', 'none');
	$('#net_inspect_response_json').css('display', 'none');
	$('#net_inspect_response_preview').css('display', 'none');
}


/**
 * HELPER FUNCTIONS
 */

function textToDivText(txt) {
	if(typeof txt == 'undefined' || txt == null) {
		return '';
	}
	txt = txt.split("<").join('&lt;');
	txt = txt.split(">").join('&gt;');
	txt = txt.split("\n").join('<br>')
	return txt;
}

/**
 * Fly/Big Box
 */
function toggleBox(box, mode) {
	var _box = $('#fly_box');
	var _boxName = 'fly';
	if(box == 'big') {
		_box = $('#big_box');
		_boxName = 'big';
	}

	if(mode == true) {
		_box.css('display', 'block');
		window.setTimeout(function() {
			_box.attr('class', 'boxes ' + _boxName + '_box-zoomed');
			_box.addClass(_boxName + '_box-zoomed');
		}, 20);
	}
	else {
		_box.attr('class', 'boxes ' + _boxName + '_box');
		window.setTimeout(function() {
			_box.css('display', 'none');
		}, 300);
	}
}


/**
 *
 * @param containerObj
 */
function selectText( containerObj ) {

    var node = containerObj[0];

    if ( document.selection ) {
        var range = document.body.createTextRange();
        range.moveToElementText( node  );
        range.select();
    } else if ( window.getSelection ) {
        var range = document.createRange();
        range.selectNode( node );
        window.getSelection().removeAllRanges();
        window.getSelection().addRange( range );
    }
}

function coverDiv(mode, onComplete) {
	if(mode)
		$('#cover_div').css("opacity",0.5).fadeIn(400, function () { if(onComplete) { onComplete() } });
	else
		$('#cover_div').fadeOut(400, function () { if(onComplete)  { onComplete() }  });
}



function strip(html) {
    var tempDiv = document.createElement("DIV");
    tempDiv.innerHTML = html;
    return tempDiv.innerText;
}

function sanitizeContenteditableDivs() {
	// Attach paste events to contenteditable divs to sanitize pasted content (remove the styling)
	$("#wrapper div").each(function() {
		//@todo: check if the event is binded already
		if($(this).attr('contenteditable')   ) {			
			$(this).bind('paste',function() {
				var self = this;
				setTimeout( function() { 
					//alert($(self).html()); 
 					var tempDiv = document.createElement("DIV");
    				tempDiv.innerHTML = $(self).html();
    				$(self).html(tempDiv.innerText);

				}, 0);
			});
		}
	});	
}