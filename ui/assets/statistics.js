/**
 *
 */
function loadStatistics() {
	console.log(Settings);
	var s = Settings.statistic_searchTerm;
		$('#statistic_search_term').html(s);

	s = Settings.proxy_prefix;
		$('#statistic_proxy_pefix').html(s);		
		
}


function saveStatistics() {
	var s = $('#statistic_search_term').html(); 
	Settings.statistic_searchTerm = s;

	s = $('#statistic_proxy_pefix').html(); 
	Settings.proxy_prefix = s;

	saveSettings();

}