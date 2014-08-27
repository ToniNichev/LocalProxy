<?php
/**
 * Util_MysqlWrapper
 * Rev: 1.0
 *
 * mysqlWrapper for the standart mysqli
 * @author toninichev
 *
 */

class Util_MysqlWrapper {

	private static $instance = null;
	private $mysqli = null;
	private $last_error = null;
	private $num_rows  = null;
	private $last_result  = null;
	private $persistantConnetion = false;
	private $connectionDetails = array();
	private $insert_id;


	// prevent instantiating this class
	private function __construct($persistantConnetion) {
		$this->persistantConnetion = $persistantConnetion;
	}


	public static function getInstance($persistantConnetion=false) {
		if(!self::$instance)
			self::$instance = new self($persistantConnetion);
		return self::$instance;
	}

	/**
	 *
	 * @param various_type $host_or_connection_array - this coould be the host string: i.e. '127.0.0.1' or an array containing
	 * 	all connection parameters. array('host' => '...', 'user' => '...', 'pass' => '...', 'db' => '...', 'port' => '...')
	 * @param string $user
	 * @param string $pass
	 * @param string $db
	 * @param int $port
	 */
	public function connect($host_or_connection_array, $user=null, $pass=null, $db=null, $port=null) {

		if(is_array($host_or_connection_array)) {
			$this->connectionDetails = $host_or_connection_array;
		}
		else {
			$this->connectionDetails = array('host' => $host_or_connection_array,
											 'user' => $user,
											 'pass' => $pass,
											 'db'   => $db,
										     'port' => $port
											);
		}
		$this->_connect();
	}

	private function _connect() {
		if($this->mysqli != null) {
			# allready connected
			return true;
		}
		# not connected, initialize the connection
		$this->mysqli = new mysqli($this->connectionDetails['host'],
								   $this->connectionDetails['user'],
								   $this->connectionDetails['pass'],
								   $this->connectionDetails['db'],
								   $this->connectionDetails['port']
							 	  );
		# check if connection fas successful
		if ($this->mysqli->connect_errno) {
			$this->last_error = mysqli_connect_error();
			print  $this->last_error;
			exit;
			return false;
		}
		else
			return true;
	}

	public function close() {
		if ($this->mysqli) {
			$this->mysqli->close();
			$this->mysqli = null;
		}
		return true;
	}

	public function is_error() {
		if ( isset($this->last_error) && !empty($this->last_error) )
			return $this->last_error;
		return false;
	}


	public function query($theQuery) {
		if(!$this->mysqli) {
			$this->_connect();
		}
		$this->last_result = NULL;
		$this->last_result = $this->_fetchData($theQuery);
		if($this->persistantConnetion == false) {
			$this->last_error = $this->mysqli->error;
			$this->close();
		}
		return $this->last_result;
	}

	public function getLastError() {
		$result = null;
		if ($this->mysqli) {
		$result = $this->mysqli->error;
		}
		else {
			$result = $this->last_error;
		}
		return $result;
	}

	public function sanitize($query) {
		if(!$this->mysqli) {
			$this->_connect();
		}
		return $this->mysqli->real_escape_string($query);
	}

	public function getNumRows() {
		return $this->num_rows;
	}

	public function getInsertedIndex() {
		return $this->insert_id;		
	}

	protected function _fetchData($theQuery) {
		if ($result = $this->mysqli->query($theQuery)) {
			if(isset($this->mysqli->insert_id))
				$this->insert_id = $this->mysqli->insert_id;
			else
				$this->insert_id = null;
			if(!is_object($result)) {
				# if this is an insert or update query just return the result
				return $result;
			}
			$this->num_rows = $result->num_rows;
			$rows = 0;
			$resultRows = array();
			while ($row = $result->fetch_assoc()) {
				$resultRows[] = $row;
				$rows++;
			}

			/* free result set */
			$result->close();
			return $resultRows;
		}
		else {;
		return FALSE;
		}
	}


}