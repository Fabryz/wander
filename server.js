var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    url  = require('url'),
    util = require('util'),
    express = require('express'),
    Player = require('./public/js/Player.js').Player,
    loadMap = require('./public/js/Map.js').loadMap,
    loadTileset = require('./public/js/Map.js').loadTileset,
    Tile = require('./public/js/Tile.js').Tile;
    
/*
* Game configs
*/

var tileset = loadTileset(),
	map = loadMap();
    
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
	speed: 48, //FIXME test 16
	spawnX: 4,	
	spawnY: 3,
	tileMapWidth: map[0].length,
	tileMapHeight: map[0][0].length,
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
    
    var date = Math.floor(date.getTime()/86400000) +'d '+ pad(date.getUTCHours())+ 'h '+ pad(date.getUTCMinutes())+ 'm ' +pad(date.getUTCSeconds()) +'s';
    
    return date;
}

function getVersion() {
	return JSON.parse(fs.readFileSync(__dirname +'/package.json', 'utf8')).version;
}

function getUptime() {
	var uptime = new Date(Date.now() - serverInfo.startedAt); //TODO: use process.uptime? need Node >v0.5

	return dateString(uptime);
}

function getMemUsed() {
	var memUsed = process.memoryUsage();	
	memUsed = Math.floor((memUsed.heapTotal / 1000000) * 100) / 100; //bytes to MB, round decimal
	
	return memUsed +'MB';
}

var app = express.createServer();

app.use(express.logger(':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'));
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

app.set('view engine', 'jade');
app.set('view options', { layout: false });
app.set('views', __dirname + '/views');

app.get('/status', function(req, res){
	var memUsed = getMemUsed(),
		uptime = getUptime(),
		version = getVersion();	
	
    res.render('status', { version: version, serverInfo: serverInfo, players: players, maxPlayers: serverConfig.maxPlayers, memUsed: memUsed, uptime: uptime });
    console.log('Memory: '+ memUsed +' used, Uptime: '+ uptime +', total players: '+ totPlayers);
});

app.listen(serverInfo.port);

serverInfo.ip = app.address().address;
serverInfo.port = app.address().port; //actual server port

console.log('Server started at '+ serverInfo.ip +':'+ serverInfo.port +' with Node '+ process.version +', platform '+ process.platform +'.');

/*
* Web Sockets
*/

function sendServerInfo(client) {
	client.emit('info', { msg: 'Welcome to "'+ serverInfo.name +'" server!' });
	client.emit('info', { msg: 'There are '+ totPlayers +' players online.' });
}

function sendServerConfig(client) {
	client.emit('config', { config: serverConfig });
	console.log('+ Sent server config to '+ client.id);
}
	
function newPlayer(client) {
	sendServerInfo(client);
	sendServerConfig(client);
	
	p = new Player(client.id, serverConfig.spawnX * serverConfig.tileWidth, serverConfig.spawnY * serverConfig.tileHeight);
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

//TODO: player is as large as a map tile?
/*function keepInsideMap(player) {
	if (player.x + serverConfig.tileWidth > serverConfig.pixelMapWidth) { 
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
}*/

//keepInsideMap returning booleans
//it uses serverConfig tile size by default
//use (x, y, 1, 1) for a point FIXME
function isInsideMap(x, y, width, height) { 
	var width = width || serverConfig.tileWidth,
		height = height || serverConfig.tileHeight;
		
	//console.log(x +':'+ y +' '+ width +'x'+ height);

	if (((x >= 0) && ((x + width - 1) < serverConfig.pixelMapWidth)) &&
		((y >= 0) && ((y + height - 1) < serverConfig.pixelMapHeight))) {
		return true;
	} else {	
		return false;
	}
}

function tileToPixelX(x) {
	return (x * serverConfig.tileWidth);
}

function tileToPixelY(y) {
	return (y * serverConfig.tileHeight);
}

function pixelToTileX(x) {
	return Math.floor(x / serverConfig.tileWidth);
}

function pixelToTileY(y) {
	return Math.floor(y / serverConfig.tileHeight);
}

//returns true if at least one player is on the way
function isPlayerOnTile(id, x, y) { //FIXME works if width/height = 48
	var lenght = players.length;
	for(var i = 0; i < lenght; i++) { 
		if (players[i].id != id) {
			//console.log(players[i].x +':'+ players[i].y +' '+ x +':'+ y);
			//console.log(pixelToTileX(players[i].x) +':'+ pixelToTileY(players[i].y) +' '+ pixelToTileX(x) +':'+ pixelToTileY(y));
			
			if ((pixelToTileX(players[i].x) == pixelToTileX(x)) && (pixelToTileY(players[i].y) == pixelToTileY(y))) {
				return true;
			}
		}
	}
	return false;
}

function hasCollisions(player, nextX, nextY, dir) {	
	//var xTile = pixelToTileX(player.x), //debug
	//	yTile = pixelToTileY(player.y); //debug
	var xTileNext = pixelToTileX(nextX),
		yTileNext = pixelToTileY(nextY);	
		
	//console.log(player.x +':'+ player.y +' > '+ nextX +':'+ nextY);		
	//console.log(xTile +':'+ yTile +' > '+ xTileNext +':'+ yTileNext);

	if (isInsideMap(nextX, nextY)) {
		var tileId = map[1][yTileNext][xTileNext], //FIXME create an actual collision map
			tile = new Tile(),
			tile = tileset[tileId];
		
		//console.dir(tile);

		if (tile.walkable === true) {
			if (isPlayerOnTile(player.id, nextX, nextY) === false) {
				//console.log('NO COLLISION!');
				return false;
			}
		}
	}
	
	//console.log('YES COLLISION!');
	return true;
}

function getTileFromId(id) {
	var length = tileset.length;
	for(var i = 0; i < length; i++) {
		if (tileset[i].id == id) {
			//console.log(tileset[i]);
			return tileset[i];
		}
	}
	
	return false;
}

//coords: x, y layer: z
function getTileFromCoords(x, y, z) {
	return getTileFromId(map[z][y][x]);
}

// Elaborate next position, send confirmed position to client 
function sendGameData(client, data) { //TODO: Do bounds and anticheat checks
	var nextX,
		nextY,
		oldX,
		oldY;

	players.forEach(function(p) {
		if (p.id == data.id) {
			oldX = p.x;
			oldY = p.y;
			
			if (data.dir == 'l') {
				nextX = oldX - serverConfig.speed;
				nextY = oldY;
			} else if (data.dir == 'r') {
				nextX = oldX + serverConfig.speed;
				nextY = oldY;
			} else if (data.dir == 'u') {
				nextX = oldX;
				nextY = oldY - serverConfig.speed;
			} else if (data.dir == 'd') {
				nextX = oldX;
				nextY = oldY + serverConfig.speed;
			}
			
			if (!hasCollisions(p, nextX, nextY, data.dir)) { //if no collisions, allow next movement
				//TODO make external control function
								
				var tileNo = 43,
					tile = getTileFromCoords(pixelToTileX(nextX), pixelToTileY(nextY), 0);

				if (tile.id == tileNo) { //above teleport tile?
					nextX = tileToPixelX(tile.extra.tx);
					nextY = tileToPixelY(tile.extra.ty);
				}
			} else { //TODO don't send? Send for client prediction?
				nextX = oldX;
				nextY = oldY;
			}

			p.x = nextX;
			p.y = nextY;
			io.sockets.emit('play', { id: p.id, x: nextX, y: nextY });
		}
	});	
}

function getPlayerFromId(id) {
	var length = players.length;
	for(var i = 0; i < length; i++) { 
		if (players[i].id == id) {
			return players[i];
		}
	}
}

//check if nick is already being used
function isUniqueNick(id, nick) { //TODO reuse on login
	var length = players.length;
	for(var i = 0; i < length; i++) { 
		if (players[i].id != id) {
			if (players[i].nick == nick) {
				return false;
			}
		}
	}
	
	return true;
}

var io = require('socket.io').listen(app),
	players = [],
	totPlayers = 0,
	json = JSON.stringify,
	pings = [];
	
io.configure(function(){ 
	io.enable('browser client minification');
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
		
		var oldNick;
		
		players.forEach(function(p) {
			if (p.id == data.id) {
				oldNick = p.nick;
				p.nick = data.nick;
			}
		});

		io.sockets.emit('nickChange', { id: data.id, nick: data.nick });
		client.emit('nickRes', { res: true });	
		console.log('* '+ oldNick +' ('+ data.id +') changed his nick to '+ data.nick);
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
		
		//console.log('Pong! '+ client.id +' '+ pings[client.id].ping +'ms'); log filler
		
		//broadcast confirmed player ping
		io.sockets.emit('pingupdate', { id: client.id, ping: pings[client.id].ping });
	});
	
	client.on('chatMsg', function(data) {		
		//console.log(data);

		var action = data.msg.split(" ");
		
		if (action[0].substring(0, 1) != '/') { //normal chat
			io.sockets.emit('chatMsg', { id: data.id, msg: data.msg });
		} else { //action message
			switch (action[0]) {
				case '/nick':
						if ((typeof action[1] != "undefined") && (action[1] != '')) {
							if (isUniqueNick(data.id, action[1])) { 
								var p = getPlayerFromId(data.id),
									oldNick = p.nick,
									newNick = action[1],
									length = players.length;
								
								for(var i = 0; i < length; i++) { 
									if (players[i].id == data.id) {
										players[i].nick = newNick;
									}
								}
					
								io.sockets.emit('nickChange', { id: data.id, nick: newNick });
								console.log('* '+ oldNick +' ('+ data.id +') changed his nick to '+ newNick);
							} else {
								client.emit('chatAction', { msg: 'That nick is already being used.' });
							}
						} else {
							client.emit('chatAction', { msg: 'Wat.' });
						}
					break;
				case '/uptime':	//emit chataction		
						client.emit('chatAction', { msg: 'This server has been up for: '+ getUptime() +'.' });
					break;
				case '/help':
						client.emit('chatAction', { msg: 'Wander help section:' });
						client.emit('chatAction', { msg: 'Use "/nick newnick" to change your nickname to newnick.' });
						client.emit('chatAction', { msg: 'Use "/uptime" to see the server uptime.' });
					break;
			
				default:
					client.emit('chatAction', { msg: 'Command not available.' });
				break;
			}
		}
	});
	
	client.on('status', function(data) {		
		var memUsed = getMemUsed(),
			uptime = getUptime();	
		
		//TODO make a span in jade to avoid passing maxPlayers
		client.emit('status', { players: players, memUsed: getMemUsed(), uptime: getUptime() });
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
				//console.log('Ping? '+ p.id); log filler
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
