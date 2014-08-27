<?php


class debugProxy {
	private $config;
	private $mysqlmanager;
	private $settings;

	private $proxy_prefix='';
	private $url = '';
	private $original_url = '';

	public function __construct($config) {
		$this->config = $config;
		$this->mysqlmanager = Util_MysqlWrapper::getInstance();
		$this->mysqlmanager->connect( $this->config->db->host,
				$this->config->db->user,
				$this->config->db->pass,
				$this->config->db->dbname,
				$this->config->db->port);


		// if use session id is set to true, 
		// request user id, or check if user id is correct
		// !! NOT IN USE !!!
		/*
		if($this->config->app->use_session_ids) {
			print_r($_POST);die;
			session_start();
			if(!array_key_exists('user_id', $_SESSION) && !array_key_exists('user_id', $_POST)) {
				echo '<form action="" method="POST">';
				echo 'user id:<input type="text" name="user_id">';
				echo '<button type="submit">submit</submit>';
				echo '</form>';
				exit;
			}
			else if(array_key_exists('user_id', $_POST) && !array_key_exists('user_id', $_SESSION)) {
				$_SESSION['user_id'] = $_POST['user_id'];
				die("!");
			}

			//$hash_value = $this->mysqlmanager->sanitize($hash_value);
			//$settingsData = $this->mysqlmanager->query("SELECT * FROM `users` WHERE hash='" . $hash_value . "'");			
		}
		*/
		
		$settingsData = $this->mysqlmanager->query("SELECT * FROM `settings` WHERE session_id='1'");
		$this->settings = $this->settingsDataToObj($settingsData);
	}

	// Config
	private $ignoreDomain = 'localhost'; // !!! small letter only. Everything will be evaluated against strtolower($url)


	public function proxyTheRequest($url) {
		$r = $this->_loadResourse($url);
		// prints response from curl request
		echo $r;
	}




	/**
	 *
	 * @param string $url
	 * @return string $result['response']
	 */
	private function _loadResourse($url) {


		$this->original_url = $url;

		/**
		 *
		 * If a 'proxy_prefix' is set up, strip the requested url.
		 * 
		 */
		$this->proxy_prefix = isset($this->settings->proxy_prefix) ? $this->settings->proxy_prefix : '';
		if($this->proxy_prefix) {
			$url = str_replace('/' . $this->proxy_prefix, '', $url);

			// re-set the original url with the stripped out version
			$this->original_url = $url;
		}


		$curl = new CurlWrapper();
		$curl_proxy = array('host' => null);


		/**
		 *
		 * Apply Rewrite Rules
		 *
		 */
		if(strpos(strtolower($url), $this->ignoreDomain) === false) {
			// Apply rules only if this is not the debugging console file
			$rewrite_rules = $this->mysqlmanager->query("SELECT * FROM `rewrite_rules` WHERE session_id='1'");
			foreach($rewrite_rules as $rule) {
				if($rule['active'] == true) {
					$replace_optons = ($rule['global'] == true ? 'g' : '') . ($rule['caseinsensitive'] == true ? 'i' : '');
					//die(">>". $replace_optons);

					$rule['url'] = str_replace('/', '\/', $rule['url']);
					$r_url = '/' .$rule['url'] . '/i';

					$request_url = $url;
					$r_replacement = $rule['replacement'];

					if(preg_match($r_url, $url)) {
						// modify header only if preg_match matches
						$url = preg_replace($r_url, $r_replacement, $url);

						$header_override = $rule['header_override'];
						$header_override = explode("\n", $header_override);
						$curl->setOptions(array(CURLOPT_HTTPHEADER => $header_override));

						// set up specific proxy port
						if($rule['port']!='') {
							$curl->setOptions(array(CURLOPT_PORT => $rule['port']));
						}				
					}
				}
			}

		/**
		 *
		 * apply the external proxy rules
		 *
		 */
			$rewrite_rules = $this->mysqlmanager->query("SELECT * FROM `external_proxies` WHERE session_id='1'");
			foreach($rewrite_rules as $rule) {
				$pattern = '/' .$rule['url_pattern'] . '/i';
				//die(">>". $pattern);

				if(preg_match($pattern, $url) == true) {
					$curl_proxy = array('host' => $rule['host'], 'port' => $rule['port']);
				}
			}

		}

		// Setting up the COOKIEs
		$cookies = $this->_extractCookies();

		$curl->setOptions(array(CURLOPT_COOKIE => $cookies));

		// set up roxy if needed
		if($curl_proxy['host']) {
			$curl->setProxy($curl_proxy['host'], $curl_proxy['port']);
		}


		// Setting up POST and GET params
		if($_POST) {
			// Setting up the post request
			$curl->setOptions(array(
					CURLOPT_SSL_VERIFYPEER => false,
					CURLOPT_TIMEOUT => 40,
					CURLOPT_FOLLOWLOCATION => true,
					CURLOPT_HEADER => TRUE,
					CURLOPT_POST => 1,
					CURLOPT_POSTFIELDS => http_build_query($_POST),
					CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:27.0) Gecko/20100101 Firefox/27.0 FirePHP/0.7.4')
			);

		}
		else {
			$curl->setOptions(array(
					CURLOPT_SSL_VERIFYPEER => false,
					CURLOPT_TIMEOUT => 40,
					CURLOPT_FOLLOWLOCATION => true,
					CURLOPT_HEADER => TRUE,
					CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.74.9 (KHTML, like Gecko) Version/7.0.2 Safari/537.74.9')
			);
		}

		$starttime = microtime(true);
		/**
		 *
		 * MAKING THE CURL REQUEST
		 *
		 */
		$result = $curl->request($url);		
		$load_time = microtime(true) - $starttime;

		/**
		 *
		 * Source code replacements
		 *
		 */
		if(strpos(strtolower($url), $this->ignoreDomain) === false) {
			// Apply rules only if this is not the debugging console file
			$rewrite_rules = $this->mysqlmanager->query("SELECT * FROM `source_replacements` WHERE session_id='1'");
			foreach($rewrite_rules as $rule) {
				if($rule['active']) {
					$rule['url'] = str_replace('/', '\/', $rule['url']);
					$r_url = '/' .$rule['url'] . '/i';

					if(preg_match($r_url, $url)) {

						$find = str_replace('/', '\/', $rule['find']);
						$find = '/' . $find . '/i';
						$replace = $rule['replace'];
						$result['response'] = preg_replace($find, $replace, $result['response']);
					}
				}
			}
		}

		/**	
		 * add the proxy_prefix 
		 *
	 	 * If a 'proxy_prefix' is set up, and if this is text/html and not JS 
		 * add the proxy_prefix for all URL links so they will be redirected to the
		 * debugging proxy
		 */

		if($this->proxy_prefix && strpos($result['info']['content_type'], 'text/html')!==false  ) {
			$p = '/' . '(href|src)=(\'|")http:\/\/(.*)(\'|")' . '/';
			$proxy_url = '$1=$2http://' . $_SERVER['HTTP_HOST'] .'/' . $this->proxy_prefix . 'http://$3$4';

			$result['response'] = preg_replace($p, $proxy_url, $result['response']);		

		}
		/**	
		 *
		 * Set up header & cookies 
		 *
		 */
		$headers_array = explode("\n", $result['header']);
		$received_cookies = array();

		foreach($headers_array as $param) {

			$param_name_val = explode(':', $param, 2);
			$h_name = strtolower($param_name_val[0]);
			$h_val = count($param_name_val) > 1 ? $param_name_val[1] : '';


			if($h_name == 'set-cookie' ) {
				$this->_setCookieFromCookieStr($h_val);
			}
			else {
				if($h_name != strtolower('Transfer-Encoding')) {
					// Skip addin Content-Length since after the overrides and string replacements the length will be different
					if(strpos(strtolower($param), 'content-length') === false) {						
						header($param);						
					}
				}
			}
		}

		//header('Access-Control-Allow-Origin: http://farjs.com');
		//header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
		//header('Access-Control-Allow-Headers: X-PINGOTHER');
		//header('Access-Control-Max-Age: 1728000');

		// Again, do logging only if this is not the proxy console
		if(strpos(strtolower($url), $this->ignoreDomain) === false)
			$this->_logNetEvent($url, $result, $load_time);

		return $result['response'];
	}

	/**
	 *
	 */
	private function _extractCookies() {
		$result = $this->_extractCookiesRecursively($_COOKIE, '');
		return $result;
	}

	/**
	 *
	 */
	private function _extractCookiesRecursively($cookieArray, $base) {
		$cookies = '';
		foreach($cookieArray as $key => $val) {

			if(is_array($val) == true) {
				$newBase = $base=='' ? $key : ($base . '[' . $key . ']');

				$cookies .= $this->_extractCookiesRecursively($val, $newBase);
			}
			else {
				if($base == '')
					$cookies .= $key . '=' . $val . '; ';
				else
					$cookies .= $base . '[' . $key . ']=' . $val . '; ';
			}
		}
		return $cookies;
	}

	/**
	 *
	 */
	private function _setCookieFromCookieStr($cookieStr) {
		// sets a cookie array
		$tmp = explode(';', $cookieStr);


		$c_params = array('expires' => null,
						  'path'	=> null,
						  'domain' 	=> null,
						  'secure'	=> null,
						  'httponly'=> null,
		);

		$co = 0;
		$c_name = '';
		$c_val = null;

		foreach($tmp as $parts) {
			$tmp2 = explode('=', $parts);
			if($co == 0) {
				// get the name and the value
				$c_name = $tmp2[0];
				$c_val = $tmp2[1];
			}
			else {
				// get other cookie parameteres
				$tmp2[0] = trim($tmp2[0]);
				$tmp2[1] = count($tmp2) > 1 ?  trim($tmp2[1]) : '';
				if($tmp2[0] == 'expires') {
					$tmp2[1] = (int)strtotime($tmp2[1]);
				}

				$c_params[$tmp2[0]] = $tmp2[1];

			}
			$co ++;
		}
		$c_name = str_replace(" ", "", $c_name);

		setcookie($c_name, $c_val, $c_params['expires'], $c_params['path'], $c_params['domain'], $c_params['secure'], $c_params['httponly']);
	}

	/**
	 *
	 * Logging the requests into the DB
	 * @param string $url
	 * @param string $data
	 * @param float $load_time
	 */
	private function _logNetEvent($url, $data, $load_time) {
		// skips logging if settings param is set to 0
		if(isset($this->settings->session_record) && $this->settings->session_record == '0')
			return;
		// extracts the status code
		$status_code = explode( "\n", $data['header'], 2);
		$status_code = preg_replace( "/HTTP\/[\d]*\.[\d]\s/" , '', $status_code[0]);

		$data['header'] = $this->mysqlmanager->sanitize($data['header']);
		$data['response'] = $this->mysqlmanager->sanitize($data['response']);

		// Check if url is rewritten
		$original_url = ($url == $this->original_url ? '' : $this->mysqlmanager->sanitize($this->original_url) );

		// call statistic functions
		$stat_search = $this->_statisticSearchTerm($url, $data);

		$result = $this->mysqlmanager->query("INSERT INTO `network` VALUES(null, '1', '" .$url . "', '"  .$data['header'] . "', '"  . $data['response'] . "' , " . $load_time . ", '" . $status_code . "' , '" . $data['info']['size_download'] . "' , '" . $stat_search . "', '" . $original_url . "' )");
		$id = $this->mysqlmanager->getInsertedIndex();
	}



	/**
	 * Find the search term in the files
	 */
	private function _statisticSearchTerm($url, $data) {
		$searchTerm = $this->settings->statistic_searchTerm;				
		if($searchTerm!='') {		
			if(preg_match('/' . $searchTerm . '/i', $data['response'])) {	
				return true;
			}
			return false;
		}
	}

	/**
	 *
	 * @return string
	 */
	function getSessionFileName() {

		return 'ui/sessions/1.txt';

	}

	/**
	 *
	 */
	 function settingsDataToObj($settingsData) {
	 	$settings = new stdClass();
	 	foreach($settingsData as $d) {
	 		$_name =$d['name'];
	 		$_val =$d['val'];
	 		$settings->$_name = $_val;

	 	}
	 	return $settings;
	 }

}



