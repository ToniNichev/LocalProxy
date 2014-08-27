<?php
/**
 *
 * 	Example usage:
 * 			$curl = new CurlWrapper();
 *			$curl->setOptions(array(CURLOPT_REFERER => 'http://www.example.org/yay.htm',
 *									CURLOPT_USERAGENT => 'MozillaXYZ/1.0'));
 *
 *			$result = $curl->request(array('http://sandbox.localhost.com/Temp/test.php', 'http://google.com'));
 *
 *			print_r($result);
 *
 * @author tonini.nichev@gmail.com
 *
 */
class CurlWrapper {

	private $requests=array();
	private $multi_handle;
	private $options = array();
	private $errors = null;


	public function __construct() {
		# set up the standart options which will be overwritten by the user settings if needed
		$this->options = array(CURLOPT_RETURNTRANSFER => TRUE,
				CURLOPT_HEADER => FALSE,
				CURLOPT_TIMEOUT => 3,
				CURLOPT_FOLLOWLOCATION => TRUE,
		);
	}

	public function setOptions($opt) {
		$this->options = $opt + $this->options;
	}

	/**
	 *
	 * @param various_type $url_s - might be string containint the url or array of strings containing
	 * 				multiple urls.
	 * @param unknown_type $resultArrayType - (used for multi results only)
	 * 				0 - array of urls
	 * 				1 - hashed array of the urls
	 * 				2 - autoincremented array (usefull if you want to hit the same url multiple times)
	 */
	public function request($url_s, $resultArrayType=0) {
		$this->_prepareForRequest();

		if(is_array($url_s)) {
			# do multirequest
			$this->_multiRequest($url_s, $resultArrayType);
			$result = $this->_getResponse();
		}
		else {
			# do single request
			$result = $this->_singleRequest($url_s);
		}
		return $result;
	}


	public function setProxy($host, $port=80) {
		$this->options[CURLOPT_HTTPPROXYTUNNEL] = true;
		$this->options[CURLOPT_PROXY] = $host;
		$this->options[CURLOPT_PROXYPORT] = $port;
		$this->options[CURLOPT_SSL_VERIFYPEER] = false;
	}

	/**
	 *
	 * @param string $url
	 * @param string $source_file_path
	 * @param string $posted_file_name
	 */
	public function postFile($url, $source_file_path, $posted_file_name) {
		$this->_prepareForRequest();
		$this->options[CURLOPT_POST] = true;
		// same as <input type="file" name="file_box">
		$this->options[CURLOPT_POSTFIELDS] = array('name' => $posted_file_name, 'file_box' =>'@'. $source_file_path );
		$this->_singleRequest($url);
	}

	public function getErrors() {
		return $this->errors;
	}


	#####################################
	# Private methods starts here
	#####################################

	private function _prepareForRequest() {
		$result = null;
		$requests = null;
		$multi_handle = null;
		$options = null;
		$errors = null;
		# check if curl is installed
		if (!function_exists('curl_init')){
			die('<CurlWrapper->request()> cURL is not installed!');
		}
	}


	private function _singleRequest($url) {
		$resutl = array();
		$ch = curl_init();
		# set up the options ad add the requested url
		curl_setopt($ch, CURLOPT_URL, $url);
		foreach($this->options as $key => $value) {
			curl_setopt($ch, $key, $value);
		}
		# execute the request
		$response = curl_exec($ch);

		// if header is sent, separate header and body
		$body = null;
		$header = null;
		if($this->options[CURLOPT_HEADER] == true) {
			//print_r($response);die;
			//$parts = explode("\n\r\n\r", $response, 2);
			// if we use proxy it adds it's own header which is medding the header size.
			// this is the only way to get headers so far.
			$parts = preg_split("/\n\r\n(?!HTTP)/", $response, 2);
			//echo '<pre>';print_r($parts);die('</pre>');
			list($header, $body) = $parts;


			/*
			$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
			$header = substr($response, 0, $header_size);
			$body = substr($response, $header_size);
			*/

			//print_r($body);die("!sds");

			//list($header, $body) = explode("\r\n\r\n", $response, 2);
			//list($header, $body) = explode("\r", $response);

		}
		else {
			// if no headers sent, just return the response
			$body = $response;
		}

		// get the last url
		$last_url = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
		$curl_info = curl_getinfo($ch);
		$this->errors[] = curl_error($ch);
		curl_close($ch);
		$result = array('header' => $header, 'response' => $body, 'last_url' => $last_url, 'info' => $curl_info);
		return $result;
	}


	private function _multiRequest($urls, $resultArrayType=0) {
		# create the multiple cURL handle
		$this->multi_handle = curl_multi_init();

		# set URL and other appropriate options
		$ch = NULL;
		$co =0;
		foreach($urls as $url) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			foreach($this->options as $key => $value) {
				curl_setopt($ch, $key, $value);
			}
			# add the handles
			curl_multi_add_handle($this->multi_handle,$ch);
			if($resultArrayType == 0)
				$this->requests[$url] = $ch;
			elseif ($resultArrayType == 1)
				$this->requests[md5($url)] = $ch;
			else
				$this->requests[$co] = $ch;
			$co ++;
		}
		$active = null;

		#execute the handles
		do {
			$mrc = curl_multi_exec($this->multi_handle, $active);

		} while ($mrc == CURLM_CALL_MULTI_PERFORM);

		while ($active && $mrc == CURLM_OK) {
			if (curl_multi_select($this->multi_handle) != -1) {
				do {
					$mrc = curl_multi_exec($this->multi_handle, $active);
					$this->errors[] = curl_error($ch);
				} while ($mrc == CURLM_CALL_MULTI_PERFORM);
			}
		}
	}

	/**
	 *
	 * @return array $result = array('response' => $response, - the result
	 * 								 'last_url' => $last_url, - the last url if there is redirection
	 */
	private function _getResponse() {
		$result = NULL;
		foreach($this->requests as $key => $request) {
			$res = curl_multi_getcontent($request);
			$last_url = curl_getinfo($request, CURLINFO_EFFECTIVE_URL);
			# get the last url if there is redirection
			$result[$key] = array('response' => $res, 'last_url' => $last_url);
			//close the handles
			curl_multi_remove_handle($this->multi_handle, $request);
		}
		curl_multi_close($this->multi_handle);
		return $result;
	}


}