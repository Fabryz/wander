/*
* TODO:
*		add sockets to frontend + backend
*		player spawning
*		collisions
*		tune up server messages/latency
*		
*/

var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    io   = require('socket.io'),
    url  = require('url');

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;  

	console.log("* HTTP request: "+ path);

	switch (path) {
		case '/favicon.ico':
		
			break;
		/*case '/css/reset.css':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				var rs = fs.createReadStream(__dirname + '/css/reset.css');
				sys.pump(rs, res);
			break;*/
		case '/css/style.css':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				var rs = fs.createReadStream(__dirname + '/css/style.css');
				sys.pump(rs, res);
			break;
		case '/js/wander.js':
				res.writeHead(200, { 'Content-Type': 'text/css' });
				var rs = fs.createReadStream(__dirname + '/js/wander.js');
				sys.pump(rs, res);
			break;
		case '/status':
				res.writeHead(200, { 'Content-Type' : 'text/plain' });
				res.end('Total players: '+ total_players);
			break;
		case '/':
		case '/index.html':
				res.writeHead(200, { 'Content-Type': 'text/html' });
				var rs = fs.createReadStream(__dirname + '/index.html');
				sys.pump(rs, res);
			break;
		case '/img/player.png':
				res.writeHead(200, { 'Content-Type': 'image/png' });
				var rs = fs.createReadStream(__dirname + '/img/player.png');
				sys.pump(rs, res);
			break;
		

		default:
			res.writeHead(404, { 'Content-Type': 'text/html' });
			res.end('THIS CAN\'T BE HAPPENING, YOU CAN\'T BE HERE!');
			//var rs = fs.createReadStream(__dirname + '/404.html');
			//sys.pump(rs, res);
		break;
	}

});

server.listen(8080);

var socket = io.listen(server),
	max_speed = 5,
	dirs = ['l', 'r', 'u', 'd'],
	init_dir = 'l',
	total_players = 0;

socket.on('connection', function(client) {
	total_players++;
	console.log('* Someone connected, total players: '+ total_players);
	

	client.on('message', function(mess) {		
		data = JSON.parse(mess);
		
		console.log(data);	
		socket.broadcast(JSON.stringify({x: data.x, y: data.y, dir: data.dir}));	
	});
	
	/* Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	client.on('disconnect', function() {
		total_players--;
		console.log('Someone disconnected, total players: '+ total_players);
	});
});
