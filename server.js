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
	url: "http://www.serverURL.com",
	admin: "Fabryz",
	email: "admin@server.com", //TODO: obfuscate?
	startedAt: Date.now()
};

//TODO Array with multiple spawns
var serverConfig = {
	maxPlayers: 32,
	speed: 16,
	spawnX: 3,	
	spawnY: 3,
	tileMapWidth: 30,
	tileMapHeight: 30,
	tileWidth: 48,
	tileHeight: 48,
};
serverConfig.pixelMapWidth = serverConfig.tileMapWidth * serverConfig.tileWidth;
serverConfig.pixelMapHeight = serverConfig.tileMapHeight * serverConfig.tileHeight;

/*
* HTTP Server
*/

function dateString(date) {
    function pad(n) {
        return (n<10? '0'+n : n);
    }
    
    var date = pad(date.getUTCHours())+'h'+ pad(date.getUTCMinutes())+'m'+ pad(date.getUTCSeconds()) +'s';
    
    return date;
}

var app = express.createServer();

app.use(express.logger('short'));
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');

app.get('/status', function(req, res){
	var memUsed = 0,
		uptime = 0,
		version = JSON.parse(fs.readFileSync(__dirname +'/package.json', 'utf8')).version;
	
	uptime = new Date(Date.now() - serverInfo.startedAt); //TODO: use process.uptime? need Node >v0.5
	uptime = dateString(uptime);	
	memUsed = process.memoryUsage();				
	memUsed = Math.floor((memUsed.heapTotal / 1000000) * 100) / 100; //bytes to MB, round decimal
	
    res.render('status', { version: version, serverInfo: serverInfo, players: players, maxPlayers: serverConfig.maxPlayers, memUsed: memUsed, uptime: uptime });
    console.log('Memory: '+ memUsed +'MB used, Uptime: '+ uptime +', total players: '+ totPlayers);
});

app.listen(serverInfo.port);

serverInfo.ip = app.address().address;
serverInfo.port = app.address().port; //actual server port

console.log('Server started at '+ serverInfo.ip +':'+ serverInfo.port +' with Node '+ process.version +', platform '+ process.platform +'.');

/*
* Web Sockets
*/
	
//player template test
function Player(id) {
	this.id = id;
	this.nick = 'Guest'+ id;
	this.x = serverConfig.spawnX * serverConfig.tileWidth;
	this.y = serverConfig.spawnY * serverConfig.tileHeight;
	this.ping = 0;
}

function sendServerInfo(client) {
	client.emit('info', { msg: '# Welcome to "'+ serverInfo.name +'" server! ('+ serverInfo.ip +':'+ serverInfo.port +')' });
	client.emit('info', { msg: '# There are now '+ totPlayers +' players online.' });
}

function sendServerConfig(client) {
	client.emit('config', { config: serverConfig });
	console.log('+ Sent server config to '+ client.id);
}
	
function newPlayer(client) {
	sendServerInfo(client);
	sendServerConfig(client);
	
	p = new Player(client.id);	
	players.push(p);
	
	client.set('id', client.id, function () {
    	client.emit('join', { player: p });
    });	
	client.broadcast.emit('newPlayer', { player: p }); //send event to all BUT not the current client
	
	console.log('+ New player: '+ p.nick);
}

function sendPlayerList(client) {
	client.emit('list', { list: players });
	console.log('* Sent player list to '+ client.id);
}

function checkBounds(player) {
	if (player.x + serverConfig.tileWidth > serverConfig.pixelMapWidth) { //TODO: player is as large as a map tile?
		player.x = serverConfig.pixelMapWidth - serverConfig.tileWidth;
	}
	if (player.x < 0) {
		player.x = 0;
	}
	
	if (player.y + serverConfig.tileHeight > serverConfig.pixelMapHeight) {
		player.y = serverConfig.pixelMapHeight - serverConfig.tileHeight;
	}
	if (player.y < 0) {
		player.y = 0;
	}
	
	return player;
}

function sendGameData(client, data) {
	/* TODO: Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	players.forEach(function(p) {
		if (p.id == client.id) {
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
	json = JSON.stringify,
	pings = [];
	
io.configure(function(){ 
	//io.enable('browser client minification');
	//io.enable('browser client etag'); 
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
	var address = client.handshake.address;
	console.log('+ New connection from ' + address.address);
		
	newPlayer(client);	
	sendPlayerList(client);	

	totPlayers++;
	console.log('+ Player connected, total players: '+ totPlayers);
		
	client.on('message', function(mess) { //forever alone
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
		//TODO: check doublenick FIXME check stuff directly on nickchange and remove nickres
		
		players.forEach(function(p) {
			if (p.id == data.id) {
				p.nick = data.nick;
			}
		});

		io.sockets.emit('nickChange', { id: data.id, nick: data.nick });
		client.emit('nickRes', { res: true });	
		console.log('* '+ data.id +' changed his nick to '+ data.nick);
	});
	
	client.on('play', function(data) {	
		sendGameData(client, data);
	});
	
	client.on('pong', function(data) {		
		pings[client.id] = { ping: (Date.now() - pings[client.id].time) };
		
		players.forEach(function(p) {
			if (p.id == client.id) {
				p.ping = pings[client.id].ping;
			}
		});
		
		console.log('Pong! '+ client.id +' '+ pings[client.id].ping +'ms');
		
		//broadcast confirmed player ping
		io.sockets.emit('pingupdate', { id: client.id, ping: pings[client.id].ping });
	});

	client.on('disconnect', function() {
		var quitter,
			i = 0;
		
		players.forEach(function(p) {
			if (p.id == client.id) {
				quitter = new Player(p.id);
				quitter = p;
				players.splice(i, 1);
			}
			i++;
		});
		client.broadcast.emit('quit', { id: client.id });
		totPlayers--;
		console.log('- Player '+ quitter.nick +' ('+ client.id +') disconnected, total players: '+ totPlayers);
	});
});

/*
* Ping
*/

// ping is intended as server -> client -> server time	
var pingInterval = setInterval(function() {
	
	if (players.length > 0) {
		players.forEach(function (p) {
			if (p.id) {
				pings[p.id] = { time: Date.now(), ping: 0};
				io.sockets.sockets[p.id].emit('ping');
				console.log('Ping? '+ p.id);
			}
		});
	}
}, 5000);

/*function showPing() {
	var avgPing = 0;
	
	if (pings.length > 0) {
		pings.forEach(function(p) {
			avgPing += p;
		});
		avgPing = Math.floor(avgPing / pings.length);
	}
	
	return avgPing;
}*/

//process.on('uncaughtException', function (err) { console.err(err ? err.stack || err : err); });
