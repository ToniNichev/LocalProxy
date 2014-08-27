<?php
$config = new stdClass();


$config->app = new stdClass();
$config->app->name = 'localProxy';
$config->app->max_net_records = 2000;
$config->app->use_session_ids = 0;

$config->db = new stdClass();

$config->db->host = '127.0.0.1';
$config->db->user = 'username';
$config->db->pass = 'password';
$config->db->dbname = 'localproxy';
$config->db->port = '3306';
