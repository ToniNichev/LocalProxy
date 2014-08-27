How to install:

Step 1: Deploy the code to directory, accessible by apache. 
    i.e. /var/www/html/vhosts/sandbox/Projects/LocalProxy/src/dev

Step 2: Create two virtual hosts pointing to the source docroot (this will be the proxy address that the browser will use), and the UI docroot (the web interface to set up and monitor the proxy)
example:

##################################################
#       Debugging Proxy
##################################################

<VirtualHost *:85>
    ServerName *
    ServerAlias dproxy.localhost.com
    ErrorLog "/usr/local/zend/apache2/logs/proxy-sandbox-error.log"
    CustomLog "/usr/local/zend/apache2/logs/proxy-sandbox-custom.log" common
    DocumentRoot "/var/www/html/vhosts/sandbox/Projects/LocalProxy/src/dev"
    <Directory "/var/www/html/vhosts/sandbox/Projects/LocalProxy/src/dev">
        Options Indexes FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
    </Directory>
</VirtualHost>

# Proxy UI


<VirtualHost *:80>
    ServerName proxy.localhost.com
    ServerAlias www.proxy.localhost.com
    ErrorLog "/usr/local/zend/apache2/logs/proxy-sandbox-error.log"
    CustomLog "/usr/local/zend/apache2/logs/proxy-sandbox-custom.log" common
    DocumentRoot "/var/www/html/vhosts/sandbox/Projects/LocalProxy/src/dev/ui"
    <Directory "/var/www/html/vhosts/sandbox/Projects/LocalProxy/src/dev/ui">
        Options Indexes FollowSymLinks
        AllowOverride All
        Order allow,deny
        allow from all
    </Directory>
</VirtualHost>




* Edit httpd.conf and allow apache to listen to port 85 as well as 80
	
	Listen 80
	Listen 85

* Now you can make http proxy calls at:
	127.0.0.1:85
		or alternativelly 
	add dproxy.localhost.com to the host file and use
	dproxy.localhost.com
	

Step 2: Run mysql.sql to create the DB


Step 3: Navigate to <localProxy root>/config/app.php and edit the DB settings, providing your mysql username and password

    $config->db->host = '127.0.0.1';
    $config->db->user = 'your mysql username';
    $config->db->pass = 'your mysql password';
    $config->db->dbname = 'localproxy';
    $config->db->port = '3306';