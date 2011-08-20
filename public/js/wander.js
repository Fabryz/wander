/*
*  Author: Fabrizio Codello
*  Name: Wander (working name)
*  Description: An HTML5 Canvas multiplayer sandbox game
*  Repo: https://github.com/Fabryz/wander
*
*/

$(document).ready(function() {		
	var arrowUp = 38,
		arrowDown = 40,
		arrowLeft = 37,
		arrowRight = 39,
		keyTab = 9,
		keySpace = 32;
		
	var gameUI = $("#gameUI"),
		gameIntro = $("#gameIntro"),
		gamePlayersList = $("#gamePlayersList"),
		playerNick = $("#playerNick"),
		playButton = $("#play");
		
	var json = JSON.stringify;
			
	/*function test_GUIclicks() {
		canvas.click(function(e) { //testing GUI clicks
			var canvasOffset = canvas.offset();
			var canvasX = Math.floor(e.pageX - canvasOffset.left);
			var canvasY = Math.floor(e.pageY - canvasOffset.top);
			
			game.debugCtx.fillText(canvasX +"x"+ canvasY, 400, 15);
			
			game.ctx.strokeStyle = "rgb(0, 0, 0)";
			game.ctx.lineWidth = 3;
			game.ctx.beginPath();
			game.ctx.moveTo(game.player.x + game.player.halfWidth, game.player.y + game.player.halfHeight);
			game.ctx.lineTo(canvasX, canvasY);
			game.ctx.closePath();
			game.ctx.stroke();
		});
	}*/
	
	function showPlayersList() {
		var list = gamePlayersList.find("ul");
	
		list.html("");
		game.players.forEach(function(p) {
			list.append("<li>"+ p +"</li>");
		});
		
		list.append("<li>&nbsp;</li>");
		list.append("<li>Total players: "+ game.players.length +"</li>");
		//gamePlayersList.stop().fadeIn('fast');
		gamePlayersList.show();
	}
	
	var attempt = 0,
		maxAttempts = 5,
		attemptTime = 1000;
		
	function setNick() {
		if (!game.check.hasNick) { //TODO: keep gameUI form open till nick is ok
			game.debug('Sending nickname');
			game.socket.emit('setNick', { nick: game.player.nick });
		}
	}
	
	function requestPlayerList() {
		if (!game.check.hasPlayerList) {
			game.debug('Requesting players list');
			game.socket.emit('playersList');
		}
	}
	
	var FPS = { 
		fps: 0,  
		fps_count: 0,
		fps_timer: 0,
		init: function() {
			FPS.fps = document.getElementById('fps');
			game.debug('FPS inited');
			FPS.fps_timer = setInterval(FPS.updateFPS, 2000);
		},
		updateFPS: function() {
			if(FPS.fps){
				FPS.fps.innerHTML = (FPS.fps_count / 2) + 'fps';
			}
			FPS.fps_count = 0;
		}
	};
			
	function startGame() {
		if (game.isReady()) {
			game.debug('Ready! Starting...');
			game.check.isPlaying = true;
			//game.canvas.focus();
							
			$(window).keydown(function(e) { //keypress?
				e.preventDefault();
				var keyCode = e.keyCode;
			
				if (keyCode == arrowLeft) {
					game.player.moveLeft = true;
				} else if (keyCode == arrowRight) {
					game.player.moveRight = true;
				} else if (keyCode == arrowUp) {
					game.player.moveUp = true;
				} else if (keyCode == arrowDown) {
					game.player.moveDown = true;
				}
				
				if (keyCode == keyTab) { //TODO: fix animation loop
					showPlayersList();
				} 
			});
			
			$(window).keypress(function(e) {
				e.preventDefault();
				var keyCode = e.keyCode;
			
			});

			$(window).keyup(function(e) {
				e.preventDefault();
				var keyCode = e.keyCode;

				if (keyCode == arrowLeft) {
					game.player.moveLeft = false;
				} else if (keyCode == arrowRight) {
					game.player.moveRight = false;
				} else if (keyCode == arrowUp) {
					game.player.moveUp = false;
				} else if (keyCode == arrowDown) {
					game.player.moveDown = false;
				}
			
				game.player.vX = 0; //FIXME useless?
				game.player.vY = 0;
				
				if (keyCode == keyTab) {
					//gamePlayersList.stop().fadeOut('fast');
					gamePlayersList.hide();
				} 
			});
			
			nowMove = (new Date()).getTime();
			
			FPS.init();
			game.initTick();
			//effe();
			ping();
		} else {
			attempt++;
			if (attempt <= maxAttempts) {
				setTimeout(startGame, attemptTime);
				game.debug('- - - Not ready, restarting in '+ attemptTime +'ms... (Attempt '+ attempt +')');
			} else {
				game.check.isPlaying = false;
				game.debug('- - - Unable to start, game stopped.');
			}
		}
		
		gameLoop();
	}
		
	function resizeCanvas() {
		//width is 95% of the page and a multiple of tileWidth
		var roughWidth = Math.floor($(window).width() * 0.95);		
		game.canvasWidth = Math.floor(roughWidth / game.serverConfig.tileWidth) * game.serverConfig.tileWidth;		
		game.canvasHeight = 480;
			
		game.canvas.attr("width", game.canvasWidth);
		game.canvas.attr("height", game.canvasHeight);
		
		game.vp.resize(game.canvasWidth, game.canvasHeight);
		
    	game.ctx.font = "15px Monospace"; //workaround FIXME
	}
	
	var game; //main game handle
	
	function gameInit() {
		game = new Game();
		game.initVars();
		game.world = new Map(game); //FIXME need to solve this
		game.vp = new Viewport(game, game.canvasWidth, game.canvasHeight);
		game.socket = new Socket(game);
		game.player = new Player(); //FIXME received server configs? (hardcoded stuff)
		
		window.addEventListener("resize", resizeCanvas, false);
		resizeCanvas();
		
		game.debug('Game inited.');
	}
	
	playerNick.focus(function() {
		if (this.value == this.defaultValue) {
		    this.select();
		}
	});
	
	/*
	//keep for client side prediction
	function movePlayer(p) {
		p.vX = 0;
		p.vY = 0;
	
		if (p.moveLeft) {
			p.vX = -speed;
		}
		if (p.moveRight) {
			p.vX = speed;
		}
		if (p.moveUp) {
			p.vY = -speed;
		}
		if (p.moveDown) {
			p.vY = speed;
		}
		
		p.x += p.vX;
		p.y += p.vY;
	}
	
	function checkBounds(p) {
		if (p.x + p.width > game.canvasWidth) {
			p.x = game.canvasWidth - p.width;
		}
		if (p.x < 0) {
			p.x = 0;
		}
		
		if (p.y + p.height > game.canvasHeight) {
			p.y = game.canvasHeight - p.height;
		}
		if (p.y < 0) {
			p.y = 0;
		}
	}
	*/
	
	var lastFps;
		
	function calcFps() {
		var now = (new Date()).getTime();
		var fps = 1000/(now - lastFps);
		lastFps = now;
		
		return Math.floor(fps);
	}
	
	function playerMoved() {
		game.player.moved = (game.player.moveLeft || game.player.moveRight || game.player.moveUp || game.player.moveDown);
		//game.debug(game.player.moved);
		
		return game.player.moved;
	}
	
	var nowMove,
		allowSendEvery = 50; //TODO: tune this, 1/16s
	
	function sendMovement() {	
		if (playerMoved()) {	//player moved. Use player.sendupdate?
			var dir = 'idle';
			if (game.player.moveLeft) {
				dir = 'l';
			}
			if (game.player.moveRight) {
				dir = 'r';
			}
			if (game.player.moveUp) {
				dir = 'u';
			}
			if (game.player.moveDown) {
				dir = 'd';
			}
			
			//send a movement every X ms
			nowMove = Date.now();
			if (nowMove - game.player.lastMove > allowSendEvery) { 
				//game.debug('5. '+ (nowMove - game.player.lastMove));
				game.socket.emit('play', { id: game.player.id, dir: dir });
				
				game.player.lastMove = Date.now();
			}
			//game.debug('4. '+nowMove+'-'+game.player.lastMove+'='+ (nowMove - game.player.lastMove) +'('+ allowSendEvery +')');
		}
	}
		
	function drawPlayer(p) {	
		if (p.id == game.player.id) {
			game.ctx.drawImage(p.avatar, game.canvasWidth / 2, game.canvasHeight / 2, p.width, p.height);
			game.ctx.fillText(p.nick +' - '+ p.moved, game.canvasWidth / 2 + p.halfWidth,  game.canvasHeight / 2 - 10);
		} else {	//everyone but player
			var coords = game.vp.mapToVp(p.x, p.y);
			
			if (game.vp.isInside(coords.x, coords.y)) { 
					//TODO: add outer render range, TILE_SIZE * X on if
				game.ctx.drawImage(p.avatar, coords.x, coords.y, p.width, p.height);
				game.ctx.fillText(p.nick +' - '+ p.moved, coords.x + p.halfWidth, coords.y - 10);
			} else {
				game.debug(p.id +' is moving out of viewport'); //don't render moving stuff out of viewport
			}
		}
	}
	
	function drawMap() {
		game.world.drawMapBounds();
		game.world.drawMap();
	}
	
	function gameLoop() {
		game.ctx.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		
		if (game.check.isPlaying) {			
			sendMovement();						
			//game.ctx.fillRect((game.canvasWidth/2) -1, (game.canvasHeight/2) -1, 3, 3);
			//checkBounds(game.player);
			game.vp.centerOn(game.player);
			drawMap();
			drawPlayer(game.player);	//assume the local copy is more updated		
			game.players.forEach(function(p) {
				if (p.id != game.player.id) {
					drawPlayer(p);
		    	}
			});

			game.debugStuff();
			
			lastFps = (new Date()).getTime();
			FPS.fps_count++; //test
			game.tick_count++;		

			setTimeout(gameLoop, 30); //test! - 1000/desired_fps
		}
	}
	
	var pingTimeout,
		pings = [];
	
	function ping() {
		if (game.check.isPlaying) {
			pingTimeout = setTimeout(function() {
				game.socket.emit('ping', { id: game.player.id });
				//game.debug('Ping?');
				ping();
			}, 5000);
		}
	}
	
	function showPing() {
		var avgPing = 0;
		
		if (pings.length > 0) {
			pings.forEach(function(p) {
				avgPing += p;
			});
			avgPing = Math.floor(avgPing / pings.length);
		}
		
		return avgPing;
	}
	
	var efpiesTimeout,
		efpies = [];
		
		//testing two kind of fps calculations
	
	function effe() {
		if (game.check.isPlaying) {
			efpiesTimeout = setTimeout(function() {
				var now = (new Date()).getTime();
				var fps = Math.floor(1000/(now - lastFps));
				lastFps = now;
				
				if (efpies.length < 5) {
					if (fps != 'Infinity') {
						efpies.push(fps);
					}
				} else {
					efpies.splice(0, 1);
				}
				game.debug(fps);
				
				effe();
			}, 1000);
		}
	}
		
	function showEfpies() {
		var avgEfpies = 0;
		
		if (efpies.length > 0) {
			efpies.forEach(function(e) {
				avgEfpies += e;
			});
			avgEfpies = Math.floor(avgEfpies / efpies.length);
		}
		
		return avgEfpies;
	}
	
	gameInit();	//Everything starts here
	
	/* 
	* Multiplayer stuff	
	*/
	
	/*function movePlayerSocket(p, dir) {
		p.vX = 0;
		p.vY = 0;
		
		if (dir == 'l') {
			p.vX = -speed;
		}
		if (dir == 'r') {
			p.vX = speed;
		}
		if (dir == 'u') {
			p.vY = -speed;
		}
		if (dir == 'd') {
			p.vY = speed;
		}
		
		p.x += p.vX;
		p.y += p.vY;
	}*/
	    
    game.socket.on('connect', function() {
    
		playButton.click(function() { //move below?
			game.debug('Clicked Play');

			if (game.check.isConnected) {
				if (playerNick.val() != '') {
					game.player.nick = playerNick.val();
				}
				game.debug('Player name set: '+ game.player.nick);

				gameIntro.fadeOut();
		
				setNick();
				//requestPlayerList();
				startGame();	//start the game only if connected
			} else {
				game.debug('You cannot play until you are connected to the server.');
				//set a timer to autorestart?
			}
		});
	
    	game.check.isConnected = true;
    	playButton.removeClass("disconnected");
    	playButton.html('Play');
		game.debug('* Connected to the server.');
	});
			
	game.socket.on('disconnect', function() {
		game.check.isConnected = false;
		game.check.isPlaying = false;
		playButton.addClass("disconnected");
		clearTimeout(pingTimeout);
		game.debug('* Disconnected from the server.');
	});
	
	game.socket.on('pong', function(data) {
		//var data = JSON.parse(mess);
		
		var ping = Date.now() - data.time;
		if (pings.length <= 5) {
			pings.push(ping);
		} else {
			pings.splice(0, 1);
		}

		//game.debug('Pong! '+ ping +'ms');
	});
	
	game.socket.on('info', function(data) {
		//var data = JSON.parse(mess);
		
		game.debug(data.msg);	
	});
	
	game.socket.on('config', function(data) {
		//var data = JSON.parse(mess);
		var config = JSON.parse(data.config);
						
		game.serverConfig.maxPlayers = config.maxPlayers;
		game.serverConfig.speed = config.speed;
		game.serverConfig.spawnX = config.spawnX;
		game.serverConfig.spawnY = config.spawnY;
		game.serverConfig.tileMapWidth = config.tileMapWidth;
		game.serverConfig.tileMapHeight = config.tileMapHeight;
		game.serverConfig.tileWidth = config.tileWidth;
		game.serverConfig.tileHeight = config.tileHeight;
		game.serverConfig.pixelMapWidth = game.serverConfig.tileMapWidth * game.serverConfig.tileWidth,
		game.serverConfig.pixelMapHeight = game.serverConfig.tileMapHeight * game.serverConfig.tileHeight;
		
		game.debug('Server config received.');
		game.check.hasConfig = true;	
	});
	
	game.socket.on('play', function(data) {
		//var data = JSON.parse(mess);
		
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				p.x = data.x;
				p.y = data.y;
				if (p.id == game.player.id) {
					game.player.x = data.x;
					game.player.y = data.y;
				}
				game.debug('player ' + p.id +' moved to '+ p.x +':'+ p.y);
			}
		});
	});
	
	game.socket.on('join', function(data) {
		//var data = JSON.parse(mess);
		var tmpPlayer = JSON.parse(data.player);
						
		game.player.id = tmpPlayer.id;
		game.player.nick = tmpPlayer.nick;
		game.player.x = tmpPlayer.x;
		game.player.y = tmpPlayer.y;
		
		game.check.hasId = true;
		game.debug('Received current player id: '+ game.player.id);
	});
	
	game.socket.on('quit', function(data) {	//TODO: FIXME
		//var data = JSON.parse(mess);
			
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				game.players.splice(0, 1);
			}
		});
		
		game.debug('Player quitted, '+ p.nick +' (id '+ data.id +')');
	});
	
	game.socket.on('nickRes', function(data) {
		//var data = JSON.parse(mess);
			
		if (data.res == 'ok') {
			game.check.hasNick = true;
			game.debug('Nick confirmed.');
		} else { //TODO: reopen input form
			game.check.hasNick = false;
			game.debug('Nick not usable.');
		}
	});
	
	game.socket.on('nickChange', function(data) {
		//var data = JSON.parse(mess);
		var oldNick = '';
						
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				oldNick = p.nick;
				p.nick = data.nick;
			}
		});
		game.debug(oldNick +' changed nick to '+ data.nick);
	});
	
	game.socket.on('newPlayer', function(data) {
		//var data = JSON.parse(mess);
		
		var tmpPlayer = JSON.parse(data.player);
						
		var newPlayer = new Player();
		newPlayer.id = tmpPlayer.id;
		newPlayer.nick = tmpPlayer.nick;
		newPlayer.x = tmpPlayer.x;
		newPlayer.y = tmpPlayer.y;
		
		if (newPlayer.id != game.player.id) {
			//game.players[tmpPlayer.id] = tmpPlayer;
			game.players.push(newPlayer);
			game.debug('New player joined: '+ json(newPlayer));
		} else { //current player
			//game.players.push(tmpPlayer); test * * *
			game.debug('You have joined the server. '+ json(newPlayer));	
		}
	});
	
	game.socket.on('playersList', function(data) {
		//var data = JSON.parse(mess);
		
		//check for empty list?
		game.debug('Receiving initial players list...');				
		game.players = []; //prepare for new list
		var playerList = JSON.parse(data.list);
	
		game.debug('Received: '+ data.list );
	
		/*playerList.forEach(function(p) {
			game.debug('INSIDE FOREACH');				
			var tmpPlayer = JSON.parse(p);

			//tmpPlayer.id = data.id;
			//tmpPlayer.nick = data.nick;
			//tmpPlayer.x = data.x;
			//tmpPlayer.y = data.y;

			game.players.push(tmpPlayer);
			game.debug('Added player '+ tmpPlayer.nick +' to list');				
		});
		for(var i = 0; i < playerList.length; i++) {
			var tmpPlayer = playerList[i];
		}
		
		*/
		
		game.players = [];
		playerList.forEach(function(p) {
			game.debug('Adding player '+ p.nick +' (id '+ p.id +') to list');				
			var tmpPlayer = new Player();
			tmpPlayer.id = p.id;
			tmpPlayer.nick = p.nick;
			tmpPlayer.x = p.x;
			tmpPlayer.y = p.y;
			
			game.players.push(tmpPlayer);
		});

		game.debug('Player list received.');
		game.check.hasPlayerList = true;		
	});
			
	game.socket.on('message', function(data) {
		//var data = JSON.parse(mess);
		
		game.debug('Message arrived: '+ data);		
		
		switch (data.type) {					
			default:
				game.debug('[Error] Unknown message type: '+ json(data) +'.');
			break;
		}
		
	});
});
