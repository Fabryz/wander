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
    url  = require('url'),
    util = require('util'),
    express = require('express');
    
/*
* Game configs
*/
    
var serverInfo = {
	name: "Illusory One",
	desc: "Test server #001",
	ip: "localhost",
	port: 8080,
	url: "www.serverURL.com",
	admin: "Fabryz",
	email: "admin@server.com", //TODO: obfuscate
	startedAt: Date.now()
};

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

function sendStatus(res) {
	var memUsed,
		uptime;

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
}

/*
* HTTP Server
*/

var app = express.createServer(
		express.logger('short'),
		express.static(__dirname + '/public'),
		express.favicon() 
	);

app.get('/status', function(req, res){
    sendStatus(res);
});

app.listen(serverInfo.port);
console.log('Server started on Node '+ process.version +', platform '+ process.platform +'.');

/*
* Socket stuff
*/
	
//player template test
function Player(id, nick) {
	this.id = id;
	this.nick = nick;
	this.x = serverConfig.spawnX;
	this.y = serverConfig.spawnY;
	
	this.playing = false;
}

function sendServerInfo(client) {
	client.emit('info', { msg: '# Welcome to "'+ serverInfo.name +'" server! ('+serverInfo.ip +':'+ serverInfo.port +')' });
	client.emit('info', { msg: '# There are now '+ totPlayers +' players online.' });
}

function sendServerConfig(client) {
	client.emit('config', { config: json(serverConfig) });
	console.log('Sent server config');
}
	
function newPlayer(id, client) {
	sendServerInfo(client);
	sendServerConfig(client);
	
	p = new Player(id, 'Guest'+id);	
	players.push(p);

	client.emit('join', { player: json(p) });
	io.sockets.emit('newPlayer', { player: json(p) });
	
	console.log('+ newPlayer: '+ json(p));
	return p;
}

function sendPlayerList(client) {
	console.log('Requested player list');
	/*if (players.length > 0) {
		players.forEach(function(pla) {
			if (pla.id != playerid) {
				client.emit('playersList', { x: pla.x, y: pla.y, id: pla.id, nick: pla.nick });
			}
		});
	} else {
		client.emit('playersList', msg: 'You are alone in the server' });
	}*/

	
	client.emit('playersList', { list: json(players) });
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
			io.sockets.emit('play', { id: p.id, x: p.x, y: p.y });
		}
	});	
}

var io = require('socket.io').listen(app),
	players = [],
	totPlayers = 0,
	currentId = -1,
	currentPid = -1,
	json = JSON.stringify;
	
io.configure(function(){ 
	io.enable('browser client etag'); 
	io.set('log level', 1); 
	io.set('transports', [ 
			'websocket',
			'flashsocket',
			'htmlfile',
			'xhr-polling',
			'jsonp-polling'
	]); 
}); 

io.sockets.on('connection', function(client) {	
	totPlayers++;
	currentId++;
	var player = newPlayer(currentId, client);
	
	sendPlayerList(client);
	
	var address = client.handshake.address;
	console.log('* New connection from ' + address.address + ':' + address.port);	
	console.log('* NEW ' +json(player));	
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
				
			default:
				console.log('[Error] Unknown message type: '+ mess);
			break;
		}

	});
	
	client.on('setNick', function(data) {
		//var data = JSON.parse(mess);
		
		//todo: must grab and update also on players array
		//players[player.id].nick = data.nick;
		players.forEach(function(p) {
			if (p.id == player.id) {
				p.nick = data.nick;
			}
		});
		io.sockets.emit('nickChange', { id: player.id, nick: data.nick });
		console.log('Nick set to '+ data.nick);
		
		//todo: check doublenick
		client.emit('nickRes', { res: 'ok' });	
	});
	
	client.on('playersList', function() {
		sendPlayerList(client);
	});
	
	client.on('play', function(data) {
		//var data = JSON.parse(mess);
		
		sendGameData(player, data);
	});
	
	client.on('ping', function(data) {
		//var data = JSON.parse(mess);
		
		client.emit('pong', { time: Date.now() });
	});

	client.on('disconnect', function() {
		players.forEach(function(p) {
			if (p.id == player.id) {
				players.splice(0, 1);
			}
		});
		io.sockets.emit('quit', { id: player.id });
		console.log('sent player quit: '+ player.id );
		
		
		totPlayers--;
		console.log('- Player '+ player.nick +' disconnected, total players: '+ totPlayers);
		player = {};
		
		console.log('Current player list: ' +json(players));
	});
});
