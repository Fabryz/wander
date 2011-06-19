/*
* TODO:
*		fix current player id
*		fix empty players on players array
*		send new position instead of dir
*		player spawning
*		collisions
*		tune up server messages/latency
*		server authority
*		broadcast playerlist on newplayer
*		
*/

var http = require('http'),
    sys  = require('sys'),
    fs   = require('fs'),
    io   = require('socket.io'),
    url  = require('url');
    
function playerList() {
	var list = '';
	
	players.forEach(function(p) {
		list += p.id +' - '+ p.nick +'\n';
	});
	
	console.log('/status Player list: '+ json(players));
	
	return list;
}

var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname,
		rs;  

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
				res.write('Total players: '+ totPlayers +'\n\n');
				if (totPlayers > 0) {
					res.write('id - nickname\n');
					res.end('Player list:\n'+ playerList());
				} else {
					res.end();
				}
				
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
			res.end("THIS CAN'T BE HAPPENING, YOU CAN'T BE HERE!");
			//rs = fs.createReadStream(__dirname + '/404.html');
			//sys.pump(rs, res);
		break;
	}

});

server.listen(8080);

/*
* Socket stuff
*/
	
var serverInfo = {
	name: "Illusory One",
	desc: "<Server description here>",
	ip: "localhost",
	port: "8080",
	url: "serverURL.com",
	admin: "Fabryz",
	mail: "admin@server.com"
};

//player template test
function Player(id, nick, x, y) {
	this.id = id;
	this.nick = nick;
	this.x = x;
	this.y = y;
	
	this.playing = false;
}

function sendServerInfo(client) {
	client.send(json({type: 'info', msg: '# Welcome to "'+ serverInfo.name +'" server! ('+serverInfo.ip +':'+ serverInfo.port +')'}));
	client.send(json({type: 'info', msg: '# There are now '+ totPlayers +' players online.'}));
}
	
var config = {
	maxPlayers: 16,
	dirs: ['l', 'r', 'u', 'd'],
	initdir: 'l',
	maxSpeed: 5,
	spawnX: 50,
	spawnY: 50
};
	
function newPlayer(id, client) {
	sendServerInfo(client);
	
	player = new Player(id, 'Guest'+id , config.spawnX, config.spawnY);	
	players[id] = player;

	client.send(json({type: 'join', player: json(player) }));
	socket.broadcast(json({type: 'newPlayer', player: json(player) }));
	
	console.log('+ newPlayer: '+ json(player));
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

function sendGameData(data) {
	/* Do bounds and anticheat checks*/
	/* Elaborate next position, send confirmed position to client */

	socket.broadcast(json({type: "play", id: data.id, x: data.x, y: data.y, dir: data.dir }));	
}

var socket = io.listen(server),
	player,
	players = [],
	totPlayers = 0,
	currentId = -1,
	currentPid = -1,
	json = JSON.stringify;

socket.on('connection', function(client) {
	totPlayers++;
	currentId++;
	newPlayer(currentId, client);
	
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
				players[player.id].nick = data.nick;
				console.log('Nick set to '+ data.nick);
				
				//todo: check doublenick
				client.send(json({type: 'nickRes', res: 'ok'}));
			break;
			case 'playersList':
				sendPlayerList(client);
			break;
			case 'play':
				sendGameData(data);
			break;
				
			default:
				console.log('[Error] Unknown message type: '+ mess);
			break;
		}

	});

	client.on('disconnect', function() {
		for (var i = 0; i < players.length; i++) {
			if (players[i] == player.id) {         
				var test = players.splice(i, 1);
				console.log('<-<-<- removed: '+ test);
			}
		}

		totPlayers--;
		console.log('- Player '+ player.nick +' disconnected, total players: '+ totPlayers);
		client.send("You left "+ serverInfo.name +".");
	});
});
