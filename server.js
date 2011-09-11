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
	spawnX: 3,	
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

function keepInsideMap(player) {
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
	//on player X or Y if LEFT or UP
	//on player X/Y + player width/height if RIGHT or DOWN
	if (dir == 'r') { //something could not be working FIXME
		nextX += player.width - 1;
	} else if (dir == 'd') {
		nextY += player.height - 1;
	}

	var xTile = pixelToTileX(player.x), //debug
		yTile = pixelToTileY(player.y); //debug
	//console.log(player.x +':'+ player.y +' > '+ nextX +':'+ nextY);

	var xTileNext = pixelToTileX(nextX),
		yTileNext = pixelToTileY(nextY);		
	//console.log(xTile +':'+ yTile +' > '+ xTileNext +':'+ yTileNext);

	//FIXME use keepInsideMap? <- transform it on true/false? not -> Send values for client pretiction?
	if (((xTileNext >= 0) && (xTileNext < serverConfig.tileMapWidth)) &&
		((yTileNext >= 0) && (yTileNext < serverConfig.tileMapHeight))) {

		var tileId = map[1][yTileNext][xTileNext],
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

function sendGameData(client, data) { //FIXME
	/* TODO: Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	players.forEach(function(p) {
		if (p.id == data.id) {
			var nextX = p.x,
				nextY = p.y;
			
			if (data.dir == 'l') {
				nextX += -serverConfig.speed;
			} else if (data.dir == 'r') {
				nextX += serverConfig.speed;
			} else if (data.dir == 'u') {
				nextY += -serverConfig.speed;
			} else if (data.dir == 'd') {
				nextY += serverConfig.speed;
			}
			
			p = keepInsideMap(p);
			
			if (!hasCollisions(p, nextX, nextY, data.dir)) { //if no collisions, allow next movement
				p.x = nextX;
				p.y = nextY;
			}
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
		
		//console.log('Pong! '+ client.id +' '+ pings[client.id].ping +'ms'); log filler
		
		//broadcast confirmed player ping
		io.sockets.emit('pingupdate', { id: client.id, ping: pings[client.id].ping });
	});
	
	client.on('chatMsg', function(data) {		
		//console.log(data);
		io.sockets.emit('chatMsg', { id: data.id, msg: data.msg });
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
