/*
* TODO:
*		player spawning
*		collisions
*		tune up server messages/latency
*		server authority
*/

var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    io   = require('socket.io'),
    url  = require('url'),
    util = require('util');
    
var serverInfo = {
	name: "Illusory One",
	desc: "Test server #001",
	ip: "localhost",
	port: "8080",
	url: "www.serverURL.com",
	admin: "Fabryz",
	email: "admin@server.com", //obfuscate
	startedAt: Date.now()
};
    
function playerList() {
	var list = '',
		i = 0;
	
	players.forEach(function(p) {
		i++;
		list += '#'+ i +' '+ json(p)+'\n';
	});
	
	console.log('/status Player list: \n'+ list);
	
	return list;
}

function dateString(date) {
    function pad(n) {
        return (n<10? '0'+n : n);
    }
    
    return pad(date.getUTCHours())+'h'+ pad(date.getUTCMinutes())+'m'+ pad(date.getUTCSeconds() +'s');
}

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname,
		rs,
		uptime,
		memUsed;  

	console.log("* HTTP request: "+ path);

	switch (path) {
		case '/favicon.ico':
				/* TODO: add favicon */
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
		case '/js/jquery-latest.min.js':	//use text/js? if < IE 8
				res.writeHead(200, { 'Content-Type': 'application/javascript' });
				rs = fs.createReadStream(__dirname + '/js/jquery-latest.min.js');
				sys.pump(rs, res);
			break;
		case '/js/wander.js':
				res.writeHead(200, { 'Content-Type': 'application/javascript' });
				rs = fs.createReadStream(__dirname + '/js/wander.js');
				sys.pump(rs, res);
			break;
		case '/status':
				memUsed = process.memoryUsage();				
				memUsed = Math.floor((memUsed.heapTotal / 1000000) * 100) / 100;
				console.log(memUsed +'MB used.');
				
				res.writeHead(200, { 'Content-Type' : 'text/plain' });				
				res.write('Server info:\n');
				res.write('\t'+ serverInfo.name +'\n\t' + serverInfo.ip +':'+ serverInfo.port +'\n');
				res.write('\t'+ serverInfo.url +'\n\n\t'+ serverInfo.desc +'\n\n');
				
				res.write('Admin: '+ serverInfo.admin +' ('+ serverInfo.email +')\n\n');

				res.write('Players: '+ totPlayers +'/'+ serverConfig.maxPlayers +'\n\n');
				if (totPlayers > 0) {
					res.write('Player list:\n'+ playerList() +'\n');
				} 
				
				uptime = new Date(Date.now() - serverInfo.startedAt); //TODO: use process.uptime?
				res.end('Uptime: '+ dateString(uptime) +'\n');
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
		case '/img/ribbon.png':
				res.writeHead(200, { 'Content-Type': 'image/png' });
				rs = fs.createReadStream(__dirname + '/img/ribbon.png');
				sys.pump(rs, res);
			break;

		default:
			res.writeHead(404, { 'Content-Type': 'text/html' });
			res.end("<h1>THIS CAN'T BE HAPPENING, YOU CAN'T BE HERE!</h1>");
			//rs = fs.createReadStream(__dirname + '/404.html');
			//sys.pump(rs, res);
		break;
	}

});

server.listen(serverInfo.port);
console.log('Server started on Node '+ process.version +', platform '+ process.platform +'.');

/*
* Socket stuff
*/
	
var serverConfig = {
	maxPlayers: 16,
	speed: 16,
	spawnX: 50,
	spawnY: 50,
	tileMapWidth: 30,
	tileMapHeight: 30,
	tileWidth: 32,
	tileHeight: 32
};

//player template test
function Player(id, nick) {
	this.id = id;
	this.nick = nick;
	this.x = serverConfig.spawnX;
	this.y = serverConfig.spawnY;
	
	this.playing = false;
}

function sendServerInfo(client) {
	client.send(json({type: 'info', msg: '# Welcome to "'+ serverInfo.name +'" server! ('+serverInfo.ip +':'+ serverInfo.port +')'}));
	client.send(json({type: 'info', msg: '# There are now '+ totPlayers +' players online.'}));
}

function sendServerConfig(client) {
	client.send(json({type: 'config', config: json(serverConfig) }));
	console.log('Sent server config');
}
	
function newPlayer(id, client) {
	sendServerInfo(client);
	sendServerConfig(client);
	
	p = new Player(id, 'Guest'+id);	
	players.push(p);

	client.send(json({type: 'join', player: json(p) }));
	socket.broadcast(json({type: 'newPlayer', player: json(p) }));
	
	console.log('+ newPlayer: '+ json(p));
	return p;
}

function sendPlayerList(client) {
	console.log('Requested player list');
	/*if (players.length > 0) {
		players.forEach(function(pla) {
			if (pla.id != playerid) {
				client.send(json({type: 'playersList', x: pla.x, y: pla.y, id: pla.id, nick: pla.nick }));
			}
		});
	} else {
		client.send(json({type: 'playersList', msg: 'You are alone in the server' }));
	}*/

	
	client.send(json({type: 'playersList', list: json(players) }));
	console.log('Sent player list: '+ json(players) );
}

function checkBounds(player) {
	var pixelMapWidth = serverConfig.tileMapWidth * serverConfig.tileWidth,
		pixelMapHeight = serverConfig.tileMapHeight * serverConfig.tileHeight;

	if (player.x + serverConfig.tileWidth > pixelMapWidth) { //TODO: player is as large as a map tile?
		player.x = pixelMapWidth - serverConfig.tileWidth;
	}
	if (player.x < 0) {
		player.x = 0;
	}
	
	if (player.y + serverConfig.tileHeight > pixelMapHeight) {
		player.y = pixelMapHeight - serverConfig.tileHeight;
	}
	if (player.y < 0) {
		player.y = 0;
	}
	
	return player;
}

function sendGameData(player, data) {
	/* TODO: Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	players.forEach(function(p) {
		if (p.id == player.id) {
			if (data.dir == 'l') {
				p.x += -serverConfig.speed;
			}
			if (data.dir == 'r') {
				p.x += serverConfig.speed;
			}
			if (data.dir == 'u') {
				p.y += -serverConfig.speed;
			}
			if (data.dir == 'd') {
				p.y += serverConfig.speed;
			}
			p = checkBounds(p);
			socket.broadcast(json({type: "play", id: p.id, x: p.x, y: p.y }));
		}
	});	
}

var socket = io.listen(server),
	players = [],
	totPlayers = 0,
	currentId = -1,
	currentPid = -1,
	json = JSON.stringify;

socket.on('connection', function(client) {
	totPlayers++;
	currentId++;
	var player = newPlayer(currentId, client);
	
	sendPlayerList(client);
	
	console.log('NEW ' +json(player));
	
	console.log('* Player connected, total players: '+ totPlayers);
		
	client.on('message', function(mess) {		
		try {
            var data = JSON.parse(mess);
        } catch (err) {
            //console.log("skip: " + sys.inspect(err));
            console.log('[Error] Malformed JSON');
            return; 
        }
		
		console.log('Arrived: '+ mess);
					
		switch (data.type) {
			case 'setNick':	//todo: must grab and update also on players array
				//players[player.id].nick = data.nick;
				players.forEach(function(p) {
					if (p.id == player.id) {
						p.nick = data.nick;
					}
				});
				socket.broadcast(json({type: 'nickChange', id: player.id, nick: data.nick }));
				console.log('Nick set to '+ data.nick);
				
				//todo: check doublenick
				client.send(json({type: 'nickRes', res: 'ok'}));
			break;
			case 'playersList':
				sendPlayerList(client);
			break;
			case 'play':
				sendGameData(player, data);
			break;
			case 'ping':
				client.send(json({type: 'pong', time: Date.now() }));
			break;
				
			default:
				console.log('[Error] Unknown message type: '+ mess);
			break;
		}

	});

	client.on('disconnect', function() {
		players.forEach(function(p) {
			if (p.id == player.id) {
				players.splice(0, 1);
			}
		});
		socket.broadcast(json({type: 'quit', id: player.id }));
		console.log('sent player quit: '+ json({type: 'quit', id: player.id }));
		
		
		totPlayers--;
		console.log('- Player '+ player.nick +' disconnected, total players: '+ totPlayers);
		player = {};
		
		console.log('Current player list: ' +json(players));
	});
});
