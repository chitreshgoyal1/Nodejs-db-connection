var express = require('express')
  , app = express()
  , http = require('http')
  	//https://www.npmjs.org/package/geolib
  , geolib = require('geolib')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
  /* 
   * 
    //database defined in Models/database.js
  , 
    mysql =  require('mysql')
      , connectionsArray    = []
      , connection          = mysql.createConnection({
            host        : 'localhost',
            user        : 'root',
            password    : '',
            database    : 'multiroomchat'
        })
      , POLLING_INTERVAL = 5000,
      pollingTimer;*/
  
server.listen(3900);

var database = require('./models/database.js');

// routing
app.get('/', function (req, res) {
	if (req.url === '/favicon.ico') {
		//console.log('favicon requested');
     res.sendfile(__dirname + '/fevi.ico');
    
    return;
  }

  res.sendfile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var uuid = '0000'

// rooms which are currently available in chat
var rooms = ['room1','room2','room3'];

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

// functions
function createRoomDB(title,device_count,is_vacent){
	var date = new Date().toISOString();
  		// INSERT NEW ROOM & NEW USER
  		connection.query( 
		"INSERT into rooms (`title`,`device_count`,`is_vacent`,`created_at`) VALUES('"+ title +"','"+ device_count +"','"+ is_vacent +"','"+ date +"')",  function(err, objRoom){
			if(err)	{
				throw err;
			}else{
				console.log(" New Room Inserted Successfully !");
			}
		});
}
function updateRoomDB(room_id){
	var date = new Date().toISOString();
  		// INSERT NEW ROOM & NEW USER
  		connection.query( 
		"UPDATE rooms SET device_count = 2, is_vacent = FALSE WHERE id = '" + room_id + "'" ,  function(err, rows){
			if(err)	{
				throw err;
			}else{
				console.log(" Rooms Table Updated Successfully !");
			}
		});
}

function createDeviceDB(room_id,name,device_type,device_id,longitude,latitude){
	
	//var device_id = decodeURIComponent(device_id);
	//var name = name.stringify;
	var date = new Date().toISOString();
		connection.query( 
		"INSERT into devices (`room_id`,`name`,`device_type`,`device_id`,`longitude`,`latitude`,`created_at`) VALUES('"+ room_id +"','"+ name + "','" + device_type +"','"+ device_id +"','"+ longitude +"','"+ latitude +"','"+ date +"')",  function(err, objDevice){
				if(err)	{
					throw err;
				}else{
					console.log(" New Device Inserted Successfully !");
				}
		});
}

function socket_data(socket,device_name,intRoomID){
	// store the username in the socket session for this client
					socket.username = device_name;
					// store the room name in the socket session for this client
					socket.room = intRoomID;
					// send client to room 1
					socket.join(intRoomID);
					// echo to client they've connected
					socket.emit('deviceadded', 'SERVER', 'you have connected to ' + intRoomID);
}

io.sockets.on('connection', function (socket) {
	// when the client emits 'adduser', this listens and executes 
	socket.on('adduser', function(jsonData){
		
		var data = { };
	/*	var fs = require('fs');
		var path = require('path');
		var filePath = path.join(__dirname + '/responsetest.txt');
		fs.readFile(filePath, function(err,localdata){
					console.log('received data: ' + localdata);
					// parse data and get object
					data = JSON.parse(localdata)
					console.log(data.data.deviceID);
		});*/
		try
		{
			data = JSON.parse(jsonData);
			console.log(jsonData);
			var clients = io.sockets.clients(uuid);
			var intRoomID = "";
			
			// ----------------------------------------------------Logic START Here----------------------------------------
			if(data){
				connection.query( "select * from rooms",  function(err, objRooms){
					if(err)	{
					  	throw err;
					}else{
						// IF NO ROOM CREATED
					  	if(objRooms.length == 0){
					  		// INITIAL SCRIPT
					  		createRoomDB("Room",1,1);
					  		
					  		connection.query( "select * from rooms",  function(err, localObjRoom){
								if(err)	{
								  	throw err;
								}else{
									intRoomID = localObjRoom[0].id;
									createDeviceDB(localObjRoom[0].id,data.device_name,data.device_type,data.device_id,data.location_data.longitude,data.location_data.latitude);
									socket_data(socket,data.device_name,intRoomID);
								}
							});
					  	}
					  	else{
					  		var arrVacentRooms = [];
	
					  		for(var i=0; i<objRooms.length; i++){
					  			if(objRooms[i].is_vacent){
					  				arrVacentRooms.push(objRooms[i].id); 
					  			}
					  		}
					  		
							if(arrVacentRooms.length == 0) {
								console.log("arrVacentRoom.length: 0 !");
								createRoomDB("Room",1,1);
								
								connection.query( "SELECT MAX(id) As id FROM rooms",  function(err, rows){
									intRoomID = rows[0].id;
									createDeviceDB(intRoomID,data.device_name,data.device_type,data.device_id,data.location_data.longitude,data.location_data.latitude);
									socket_data(socket,data.device_name,intRoomID);
								});
							}else if(arrVacentRooms.length == 1) {
								intRoomID = arrVacentRooms[0];
								console.log("arrVacentRoom.length: 1 !");
								updateRoomDB(intRoomID);
								createDeviceDB(intRoomID,data.device_name,data.device_type,data.device_id,data.location_data.longitude,data.location_data.latitude);
								socket_data(socket,data.device_name,intRoomID);
		
							}
							
							/*
							else
							{
								console.log("you are here--->1---");
								connection.query(
								"SELECT * FROM devices where room_id in (" + arrVacentRooms.join(",") + ")", function(err, rows){
									if(err)	{
										throw err;
									}else{
										console.log( rows );
										
										var tempDiff = [];
										for(var i =0; i<rows.length; i++){
											
											var diff =  geolib.getDistance(
													{latitude: rows[i].longitude, longitude: rows[i].latitude}, 
													{latitude: 26.935894, longitude: 75.797977 }
											);
											tempDiff.push({
												room_id : rows[i].room_id,
												diff : diff
											});
										}
											console.log(tempDiff);
											console.log(tempDiff.length);
											
											var tempVar = "";
											var tempRoomID = "";
											
											for(var i=0; i<tempDiff.length; i++){
												console.log(tempDiff);
												if(tempVar == ""){
													tempVar = tempDiff[i].diff;			// Calculating nearest device
													tempRoomID = tempDiff[i].room_id; 
												}else if(tempVar > tempDiff[i].diff){
													tempVar = tempDiff[i].diff;			// Calculating nearest device
													tempRoomID = tempDiff[i].room_id;
												}
											}
											intRoomID = tempRoomID;
											updateRoomDB(intRoomID);
											createDeviceDB(intRoomID.id,data.device_name,,data.device_id,data.location_data.longitude,data.location_data.latitude);
											console.log("ROOM UPDATED ! DEVICE CREATED");
									}
								});
							}*/
					  	}
					}
				});
			}
		// ----------------------------------------------------Logic END Here----------------------------------------
		}catch(err){
			console.log("::adduser::");
			console.log(err);
		}
		
		
	});

	socket.on('requestconnection', function (device_id) {
		
		try{
			console.log("Device_id: "+ device_id);
			connection.query( "select * from devices where device_id = '"+ device_id +"'",  function(err, localObjDevice){
				if(err)	{
					  throw err;
				}else{
					connection.query( "select * from rooms where id = '"+ localObjDevice[0].room_id +"'",  function(err, localObjRoom){
						if(err)	{
							  throw err;
						}else{
							
							if(!localObjRoom[0].is_vacent) {
								connection.query( "select * from DEVICES where room_id = '"+ localObjDevice[0].room_id +"'",  function(err, localObjDevice){
									if(err)	{
										  throw err;
									}else{
										console.log("Return data for both devices!");
										var arrdevices = [];
										
										for(var i=0; i<localObjDevice.length; i++){
								  			var objdev  = {};
								  			objdev.device_id = localObjDevice[i].device_id;
								  			objdev.device_name = localObjDevice[i].name;
								  			arrdevices.push(objdev);
								  		}
										var devices = {"devices" : arrdevices}
										console.log(devices);
										io.sockets.in(socket.room).emit('confirmuser', devices);
									}
								});
							}else{
								return false;
							}
						}
					});
				}
			});
		}catch(err){
			console.log("::requestconnection::");
			console.log(err);
		}
	});
	
	socket.on('useracceptedconnection', function (data) {
		// we tell the client to execute '       ' with 2 parameters
		io.sockets.in(socket.room).emit('useracceptedconnection', data);
	});

	socket.on('userdeniedconnection', function (data) {
		// we tell the client to execute '       ' with 2 parameters
		io.sockets.in(socket.room).emit('userdeniedconnection', data);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		try{
			// remove the username from global usernames list
			delete usernames[socket.username];
			console.log("USERNAME: "+ socket.username);
			console.log("ROOM: "+ socket.room);
			connection.query("DELETE from DEVICES where room_id = '"+ socket.room +"'",  function(err, localObjDevice){
				if(err)	{
					  throw err;
				}else{
					console.log(localObjDevice);
				}
			});
			connection.query("DELETE from ROOMS where id = '"+ socket.room +"'",  function(err, localObjRoom){
				if(err)	{
					  throw err;
				}else{
					console.log(localObjRoom);
				}
			});
			// update list of users in chat, client-side
			//io.sockets.emit('updateusers', usernames);
			// echo globally that this client has left
			//socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.leave(socket.room);
		}catch(err){
			console.log("::disconnect::");
			console.log(err);
		}
		
		
	});
	
});
