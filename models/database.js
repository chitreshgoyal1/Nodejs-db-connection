var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , 
    mysql =  require('mysql')
      , connectionsArray    = []
      , connection          = mysql.createConnection({
            host        : 'localhost',
            user        : 'root',
            password    : '',
        })
      , POLLING_INTERVAL = 5000,
      pollingTimer;
	
connection.connect(function(err, results) {
    if (err) {
        console.log("ERROR: " + err.message);
        throw err;
    }
    console.log("connected.");
	
	// CREATE DATABASE TABLE
	connection.query('CREATE DATABASE multiroomchat', function(err, results) {
			if (err && err.number != connection.ERROR_DB_CREATE_EXISTS) {
				console.log("ERROR: " + err.message);
				throw err;
			}
			console.log("Database created OR already exists.");
			
			// SELECT DATABASE
			connection.query('USE multiroomchat', function(err, results) {
				if (err) {
					console.log("ERROR: " + err.message);
					throw err;
				}
				
				// CREATE DATABASE TABLES
					connection.query(
							'CREATE TABLE rooms'+
							'(id INT(11) AUTO_INCREMENT, '+
							'title VARCHAR(255), '+
							'device_count INT(11), '+
							'is_vacent BOOLEAN DEFAULT 1, '+
							'created_at DATETIME, '+
							'PRIMARY KEY (id));', function(err, results) {
								if (err && err.number != connection.ERROR_TABLE_EXISTS_ERROR) {
									console.log("ERROR: " + err.message);
									throw err;
								}
								console.log("Rooms Table Created!");
							}
					);
					connection.query(
							'CREATE TABLE devices'+
							'(id INT(11) AUTO_INCREMENT, '+
							'room_id INT(11), '+
							'name VARCHAR(255), '+
							'device_type VARCHAR(255), '+
							'device_id VARCHAR(255), '+
							'longitude VARCHAR(255), '+
							'latitude VARCHAR(255), '+
							'created_at DATETIME, '+
							'PRIMARY KEY (id));', function(err, results) {
								if (err && err.number != connection.ERROR_TABLE_EXISTS_ERROR) {
									console.log("ERROR: " + err.message);
									throw err;
								}
								console.log("Devices Table Created!");
							}
					);
					// CREATING TABLES END HERE	
			});
			// USE DATABASE END HERE
	});
	// DATABASE CREATION END HERE
});

global.connection = connection;
