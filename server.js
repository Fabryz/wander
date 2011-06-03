/*
* TODO:
*		add sockets to frontend + backend
*		player spawning
*		collisions
*		tune up server messages/latency
*		server authority
*		
*/

var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    io   = require('socket.io'),
    url  = require('url');

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;
	var rs;  

	console.log("* HTTP request: "+ path);

	switch (path) {
		case '/favicon.ico':
		
			break;
		/*case '/css/reset.css':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				rs = fs.createReadStream(__dirname + '/css/reset.css');
				sys.pump(rs, res);
			break;*/
		case '/css/style.css':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				rs = fs.createReadStream(__dirname + '/css/style.css');
				sys.pump(rs, res);
			break;
		case '/js/wander.js':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				rs = fs.createReadStream(__dirname + '/js/wander.js');
				sys.pump(rs, res);
			break;
		case '/status':
				res.writeHead(200, { 'Content-Type' : 'text/plain' });
				res.end('Total players: '+ total_players);
			break;
		case '/':
		case '/index.html':
				res.writeHead(200, { 'Content-Type': 'text/html' });
				rs = fs.createReadStream(__dirname + '/index.html');
				sys.pump(rs, res);
			break;
		case '/img/player.png':
				res.writeHead(200, { 'Content-Type': 'image/png' });
				rs = fs.createReadStream(__dirname + '/img/player.png');
				sys.pump(rs, res);
			break;
		

		default:
			res.writeHead(404, { 'Content-Type': 'text/html' });
			res.end('THIS CAN\'T BE HAPPENING, YOU CAN\'T BE HERE!');
			//rs = fs.createReadStream(__dirname + '/404.html');
			//sys.pump(rs, res);
		break;
	}

});

server.listen(8080);

var socket = io.listen(server),
	max_speed = 5,
	dirs = ['l', 'r', 'u', 'd'],
	init_dir = 'l',
	total_players = 0,
	max_players = 16,
	playersid = 0,
	playerid = 0,
	players = [],
	connected = false,
	server_name = "Illusory One";

socket.on('connection', function(client) {
	total_players++;
	console.log('* Someone connected, total players: '+ total_players);
	
	client.on('message', function(mess) {		
		var data = JSON.parse(mess);
		
		if (!connected) {
			client.send(JSON.stringify({type: 'srv_msg', msg: '* Welcome to "'+ server_name +'" server!'}));
			client.send(JSON.stringify({type: 'srv_msg', msg: '* There are '+ total_players +' players online.'}));
			connected = true;
		} else {
						
			var msg_type = data.type;
			switch (msg_type) {
				case 'newPlayer':
					playersid++;
					playerid = playersid;
					
					console.log('newPlayer id:'+ playersid +' nick: '+ data.nick);
					
					players[playerid] = { "nick": data.nick };
					
					
					
					client.send(JSON.stringify({type: 'newPlayer', id: playerid, x: 50, y: 50}));	
				break;
				case 'playersList':
					if (players.length > 0) {
						players.forEach(function(pla) {
							if (pla.id != playerid) {
								client.send(JSON.stringify({type: 'playersList', x: pla.x, y: pla.y, id: pla.id, nick: pla.nick }));
							}
						});
					} else {
						client.send(JSON.stringify({type: 'playersList', msg: 'You are alone in the server' }));
					}
				break;
				case 'play':
					var test = JSON.stringify({type: "play", id: data.id, x: data.x, y: data.y, dir: data.dir});

					console.log('Arrived: '+ mess);	
					console.log('Sending: '+ test);

					socket.broadcast(test);	
				break;
					
				default:
					console.log('Unknown type: '+ mess);
				break;
			}
		}

	});
	
	/* Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	client.on('disconnect', function() {
		delete players[playerid];
		total_players--;
		console.log('Someone disconnected, total players: '+ total_players);
		client.send("You left "+ server_name +".");
	});
});
