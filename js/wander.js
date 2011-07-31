/*
* Author: Fabrizio Codello
* Date: 2011/07/10
* Version: 0.3.7.4
* https://github.com/Fabryz/wander
*
*/

$(document).ready(function() {
	var canvas = $("#gameCanvas");
	var ctx = canvas.get(0).getContext("2d");
	
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	var desiredFPS = 30;
	
	var startButton = $("#startAnimation"),
		stopButton = $("#stopAnimation");
		
	var debugCanvas = $("#debugCanvas"),
		debugCtx = debugCanvas.get(0).getContext("2d"),
		debugLog = $("#debugLog ul");
	
	var socket;
		
	/*startButton.hide();
	startButton.click(function() {
		$(this).hide();
		stopButton.show();
		
		check.isPlaying = true;
		debugMsg('Started');
		gameLoop();
	});
	
	stopButton.click(function() {
		$(this).hide();
		startButton.show();
		
		check.isPlaying = false;
		debugMsg('Stopped');
	});*/
	
	var serverConfig = {	//default config
		maxPlayers: 8,
		speed: 16,
		spawnX: 0,
		spawnY: 0,
		tileMapWidth: 15,
		tileMapHeight: 15,
		tileWidth: 32,
		tileHeight: 32,
		pixelMapWidth: this.tileMapWidth * this.tileWidth,
		pixelMapHeight: this.tileMapHeight * this.tileHeight
	};
	
	function Player() {
		this.id = -1;
		this.nick = "";
		this.x = 0;
		this.y = 0;
		this.vX = 0;
		this.vY = 0;
		
		this.alive = true;
		this.status = "normal";
		this.lastMove = Date.now();
		this.hp = 100;
		this.inventory = [];
		
		this.avatar = new Image();
		this.avatar.src = './img/player.png';
		this.width = serverConfig.tileWidth;
		this.height = serverConfig.tileHeight;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2; 		
		
		this.moved = false;
		this.moveLeft = false;
		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		
		this.toString = function() {
		    return this.nick +' id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+') '+ this.vX +' '+ this.vY;
		};
		    
		/*this.draw = function(c) {
		    c.drawImage(this.avatar, this.x, this.y, this.width, this.height);
		    c.fillText(this.nick, this.x + this.halfWidth, this.y - 10);
		};*/
	}
	
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
	
	//boolean var for every phase of the connection
	var check = {
		isConnected: false,
		hasConfig: false,
		hasId: false,
		hasNick: false,
		hasPlayerList: false,
		//isReady: false,
		isPlaying: false
	};
	
	function debugMsg(msg) {
		debugLog.prepend('<li>'+ msg +'</li>');
	}
	
	function isReady() {
		debugMsg(check.isConnected +' '+ check.hasConfig +' '+ check.hasId +' '+ check.hasNick +' '+ check.hasPlayerList);
		return check.isConnected && check.hasConfig && check.hasId && check.hasNick && check.hasPlayerList;
	}
	
	var player,
		players = [];	
		
	/*function test_GUIclicks() {
		canvas.click(function(e) { //testing GUI clicks
			var canvasOffset = canvas.offset();
			var canvasX = Math.floor(e.pageX - canvasOffset.left);
			var canvasY = Math.floor(e.pageY - canvasOffset.top);
			
			debugCtx.fillText(canvasX +"x"+ canvasY, 400, 15);
			
			ctx.strokeStyle = "rgb(0, 0, 0)";
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(player.x + player.halfWidth, player.y + player.halfHeight);
			ctx.lineTo(canvasX, canvasY);
			ctx.closePath();
			ctx.stroke();
		});
	}*/
	
	function showPlayersList() {
		var list = gamePlayersList.find("ul");
	
		list.html("");
		players.forEach(function(p) {
			list.append("<li>"+ p +"</li>");
		});
		
		list.append("<li>&nbsp;</li>");
		list.append("<li>Total players: "+ players.length +"</li>");
		//gamePlayersList.stop().fadeIn('fast');
		gamePlayersList.show();
	}
	
	var attempt = 0,
		maxAttempts = 5,
		attemptTime = 1000;
		
	function setNick() {
		if (!check.hasNick) { //TODO: keep gameUI form open till nick is ok
			debugMsg('Sending nickname');
			socket.send(json({ type: 'setNick', nick: player.nick}));
		}
	}
	
	function requestPlayerList() {
		if (!check.hasPlayerList) {
			debugMsg('Requesting players list');
			socket.send(json({ type: 'playersList'}));
		}
	}
	
	var FPS = { 
		fps: 0,  
		fps_count: 0,
		fps_timer: 0,
		init: function(){
			FPS.fps = document.getElementById('fps');
			debugMsg('FPS inited');
			FPS.fps_timer = setInterval(FPS.updateFPS, 2000);
		},
		updateFPS: function(){
			if(FPS.fps){
				FPS.fps.innerHTML = (FPS.fps_count / 2) + 'fps';
			}
			FPS.fps_count = 0;
		}
	};
			
	function startGame() {
		if (isReady() == true) {
			debugMsg('Ready! Starting...');
			check.isPlaying = true;
							
			$(window).keydown(function(e) { //keypress?
				e.preventDefault();
				var keyCode = e.keyCode;
			
				if (keyCode == arrowLeft) {
					player.moveLeft = true;
				} else if (keyCode == arrowRight) {
					player.moveRight = true;
				} else if (keyCode == arrowUp) {
					player.moveUp = true;
				} else if (keyCode == arrowDown) {
					player.moveDown = true;
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
					player.moveLeft = false;
				} else if (keyCode == arrowRight) {
					player.moveRight = false;
				} else if (keyCode == arrowUp) {
					player.moveUp = false;
				} else if (keyCode == arrowDown) {
					player.moveDown = false;
				}
			
				player.vX = 0;
				player.vY = 0;
				
				if (keyCode == keyTab) {
					//gamePlayersList.stop().fadeOut('fast');
					gamePlayersList.hide();
				} 
			});
			
			nowMove = (new Date()).getTime();
			
			FPS.init();
			//effe();
			ping();
		} else {
			attempt++;
			if (attempt <= maxAttempts) {
				setTimeout(startGame, attemptTime);
				debugMsg('- - - Not ready, restarting in '+ attemptTime +'ms... (Attempt '+ attempt +')');
			} else {
				check.isPlaying = false;
				debugMsg('- - - Unable to start, game stopped.');
			}
		}
		
		gameLoop();
	}
		
	function resizeCanvas() {
		//width is 90% of the page and a multiple of tileWidth
		var roughWidth = Math.floor($(window).width() * 0.9);		
		canvasWidth = Math.floor(roughWidth / serverConfig.tileWidth) * serverConfig.tileWidth;		
		canvasHeight = 480;
			
		$(canvas).attr("width", canvasWidth);
		$(canvas).attr("height", canvasHeight);
		
    	ctx.font = "15px Monospace"; //workaround
	}
	
	function gameInit() {
		window.addEventListener("resize", resizeCanvas, false);
		resizeCanvas();
		
		gamePlayersList.hide();
	
		socket = new io.Socket(null, {port: window.location.port, rememberTransport: false});
    	socket.connect();
    	debugMsg('Connecting...');

		ctx.fillStyle = 'rgb(0, 0, 0)';
    	ctx.font = "15px Monospace";
		
		debugCtx.fillStyle = 'rgb(0, 0, 0)';
    	debugCtx.font = "15px Monospace";
    	
    	//if (check.hasConfig) { //TODO: grab configs before starting
    		player = new Player();
    	//}
		
		debugMsg('Game inited.');
	}
	
	playerNick.focus(function() {
		if (this.value == this.defaultValue) {
		    this.select();
		}
	});
	
	/*
	//keep for a better client side interaction?
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
	}*/
	
	function checkBounds(p) {
		if (p.x + p.width > canvasWidth) {
			p.x = canvasWidth - p.width;
		}
		if (p.x < 0) {
			p.x = 0;
		}
		
		if (p.y + p.height > canvasHeight) {
			p.y = canvasHeight - p.height;
		}
		if (p.y < 0) {
			p.y = 0;
		}
	}
	
	var lastFps;
		
	function calcFps() {
			var now = (new Date()).getTime();
			var fps = 1000/(now - lastFps);
			lastFps = now;
			
			return Math.floor(fps);
	}
	
	function debugStuff() {
		debugCtx.clearRect(0, 0, 500, 70);
		debugCtx.fillText(player, 10, 15);
		ctx.fillText(calcFps()+ 'fps', canvasWidth - 60, 20);
		ctx.fillText(showPing()+ 'ms', canvasWidth - 120, 20);
		ctx.fillText(vpX +':'+ vpY, 10, 20);
	}
	
	function playerMoved() {
		player.moved = (player.moveLeft || player.moveRight || player.moveUp || player.moveDown);
		//debugMsg(player.moved);
		
		return player.moved;
	}
	
	var nowMove,
		allowSendEvery = 50; //TODO: tune this, 1/16s
	
	function sendMovement() {	
		if (playerMoved()) {	//player moved. Use player.sendupdate?
			var dir = 'idle';
			if (player.moveLeft) {
				dir = 'l';
			}
			if (player.moveRight) {
				dir = 'r';
			}
			if (player.moveUp) {
				dir = 'u';
			}
			if (player.moveDown) {
				dir = 'd';
			}
			
			//send a movement every X ms
			nowMove = Date.now();
			if (nowMove - player.lastMove > allowSendEvery) { 
				//debugMsg('5. '+ (nowMove - player.lastMove));
				socket.send(json({  type: 'play', id: player.id, dir: dir  }));
				
				player.lastMove = Date.now();
			}
			//debugMsg('4. '+nowMove+'-'+player.lastMove+'='+ (nowMove - player.lastMove) +'('+ allowSendEvery +')');
		}
	}
	
	var vpX = 0,
		vpY = 0;
		
	function moveViewport(p) {
		vpX = p.x - (canvasWidth / 2);
		vpY = p.y - (canvasHeight / 2);
	}
		
	function swapCoords(x, y) {
		var coords = {};
		
		coords.x = Math.abs(vpX) + x;
		coords.y = Math.abs(vpY) + y
		
		debugMsg(x +':'+ y +' -> '+ coords.x +':'+ coords.y);
		
		return coords;
	}
	
	function drawPlayer(p) {	
		if (p.id == player.id) {
			ctx.drawImage(p.avatar, canvasWidth / 2, canvasHeight / 2, p.width, p.height);
			ctx.fillText(p.nick +' - '+ p.moved, canvasWidth / 2 + p.halfWidth,  canvasHeight / 2 - 10);
		} else {	//everyone but player
			var coords = swapCoords(p.x, p.y);
			
			if (((coords.x >= 0) && (coords.x < canvasWidth)) && ((coords.y >= 0) && (coords.y < canvasHeight))) { 
					//TODO: add outer render range, TILE_SIZE * X on if
				ctx.drawImage(p.avatar, coords.x, coords.y, p.width, p.height);
				ctx.fillText(p.nick +' - '+ p.moved, coords.x + p.halfWidth, coords.y - 10);
			} else {
				debugMsg(p.id +' is moving out of viewport'); //don't render moving stuff out of viewport
			}
		}
	}
	
	function drawMapBounds() {
		ctx.strokeStyle = "#CCC";
		ctx.lineWidth = 8;
		
		var coords = swapCoords(0, 0);
		
		//debugMsg(json(coords));
		
		ctx.strokeRect(coords.x, coords.y, serverConfig.pixelMapWidth, serverConfig.pixelMapHeight);
	}
	
	function gameLoop() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (check.isPlaying) {			
			sendMovement();						
			//ctx.fillRect((canvasWidth/2) -1, (canvasHeight/2) -1, 3, 3);
			//checkBounds(player);
			
			moveViewport(player);
			drawMapBounds();
			drawPlayer(player);	//assume the local copy is more updated		
			players.forEach(function(p) {
				if (p.id != player.id) {
					drawPlayer(p);
		    	}
			});

			debugStuff();
			
			lastFps = (new Date()).getTime();
			FPS.fps_count++; //test
			
			setTimeout(gameLoop, 10); //test! - 1000/desired_fps
		}
	}
	
	var pingTimeout,
		pings = [];
	
	function ping() {
		if (check.isPlaying) {
			pingTimeout = setTimeout(function() {
				socket.send(json({ type: 'ping', id: player.id }));
				//debugMsg('Ping?');
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
		if (check.isPlaying) {
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
				debugMsg(fps);
				
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
	    
    socket.on('connect', function() {
    
		playButton.click(function() { //move below?
			debugMsg('Clicked Play');

			if (check.isConnected) {
				if (playerNick.val() != '') {
					player.nick = playerNick.val();
				}
				debugMsg('Player name set: '+ player.nick);

				gameIntro.fadeOut();
		
				setNick();
				//requestPlayerList();
				startGame();	//start the game only if connected
			} else {
				debugMsg('You cannot play until you are connected to the server.');
				//set a timer to autorestart?
			}
		});
	
    	check.isConnected = true;
    	playButton.removeClass("disconnected");
    	playButton.html('Play');
		debugMsg('* Connected to the server.');
	});
			
	socket.on('disconnect', function() {
		check.isConnected = false;
		check.isReady = false;
		check.isPlaying = false;
		playButton.addClass("disconnected");
		clearTimeout(pingTimeout);
		debugMsg('* Disconnected from the server.');
	});
			
	socket.on('message', function(mess) {
		var data = JSON.parse(mess);
		
		//debugMsg('Message arrived: '+ mess);		
		
		switch (data.type) {
				case 'pong':
						var ping = Date.now() - data.time;
						if (pings.length <= 5) {
							pings.push(ping);
						} else {
							pings.splice(0, 1);
						}
				
						//debugMsg('Pong! '+ ping +'ms');
					break;
				case 'info':
						debugMsg(data.msg);	
					break;
				case 'config':
						var config = JSON.parse(data.config);
						
						serverConfig.maxPlayers = config.maxPlayers;
						serverConfig.speed = config.speed;
						serverConfig.spawnX = config.spawnX;
						serverConfig.spawnY = config.spawnY;
						serverConfig.tileMapWidth = config.tileMapWidth;
						serverConfig.tileMapHeight = config.tileMapHeight;
						serverConfig.tileWidth = config.tileWidth;
						serverConfig.tileHeight = config.tileHeight;
						serverConfig.pixelMapWidth = serverConfig.tileMapWidth * serverConfig.tileWidth,
						serverConfig.pixelMapHeight = serverConfig.tileMapHeight * serverConfig.tileHeight;
						
						debugMsg('Server config received.');
						check.hasConfig = true;	
					break;
				case 'play':
						players.forEach(function(p) {
							if (p.id == data.id) {
								p.x = data.x;
								p.y = data.y;
								if (p.id == player.id) {
									player.x = data.x;
									player.y = data.y;
								}
								//console.log('player ' + p.id +' moved to '+ p.x +':'+ p.y);
							}
						});
					break;
				case 'join':
						var tmpPlayer = JSON.parse(data.player);
						
						player.id = tmpPlayer.id;
						player.nick = tmpPlayer.nick;
						player.x = tmpPlayer.x;
						player.y = tmpPlayer.y;
						
						check.hasId = true;
						debugMsg('Received current player id: '+ player.id);
					break;
				case 'quit': //TODO: FIXME
						players.forEach(function(p) {
							if (p.id == data.id) {
								players.splice(0, 1);
							}
						});
						
						debugMsg('Player quitted, '+ p.nick +' (id '+ data.id +')');
					break;
				case 'nickRes':
						if (data.res == 'ok') {
							check.hasNick = true;
							debugMsg('Nick confirmed.');
						} else { //TODO: reopen input form
							check.hasNick = false;
							debugMsg('Nick not usable.');
						}
					break;
				case 'nickChange':
						var oldNick = '';
						
						players.forEach(function(p) {
							if (p.id == data.id) {
								oldNick = p.nick;
								p.nick = data.nick;
							}
						});
						debugMsg(oldNick +' changed nick to '+ data.nick);
					break;
				case 'newPlayer':
						var tmpPlayer = JSON.parse(data.player);
						
						var newPlayer = new Player();
						newPlayer.id = tmpPlayer.id;
						newPlayer.nick = tmpPlayer.nick;
						newPlayer.x = tmpPlayer.x;
						newPlayer.y = tmpPlayer.y;
						
						if (newPlayer.id != player.id) {
							//players[tmpPlayer.id] = tmpPlayer;
							players.push(newPlayer);
							debugMsg('New player joined: '+ json(newPlayer));					} else { //current player
							//players.push(tmpPlayer); test * * *
							debugMsg('You have joined the server. '+ json(newPlayer));	
						}
					break;
				case 'playersList': //check for empty list?
						debugMsg('Receiving initial players list...');				
						players = []; //prepare for new list
						var playerList = JSON.parse(data.list);
					
						debugMsg('Received: '+ data.list );
					
						/*playerList.forEach(function(p) {
							debugMsg('INSIDE FOREACH');				
							var tmpPlayer = JSON.parse(p);
				
							//tmpPlayer.id = data.id;
							//tmpPlayer.nick = data.nick;
							//tmpPlayer.x = data.x;
							//tmpPlayer.y = data.y;
				
							players.push(tmpPlayer);
							debugMsg('Added player '+ tmpPlayer.nick +' to list');				
						});
						for(var i = 0; i < playerList.length; i++) {
							var tmpPlayer = playerList[i];
						}
						
						*/
						
						players = [];
						playerList.forEach(function(p) {
							debugMsg('Adding player '+ p.nick +' (id '+ p.id +') to list');				
							var tmpPlayer = new Player();
							tmpPlayer.id = p.id;
							tmpPlayer.nick = p.nick;
							tmpPlayer.x = p.x;
							tmpPlayer.y = p.y;
							
							players.push(tmpPlayer);
						});
	
						debugMsg('Player list received.');
						check.hasPlayerList = true;			
				break;
					
				default:
					debugMsg('[Error] Unknown message type: '+ data.type +'.');
				break;
		}
		
			
		
	});
});
