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
		keySpace = 32,
		keyEnter = 13,
		keyW = 87,
		keyS = 83,
		keyA = 65,
		keyD = 68,
		keyBackslash = 220;
		
	var gameUI = $("#gameUI"),
		gameIntro = $("#gameIntro"),
		gamePlayersList = $("#gamePlayersList"),
		playerNick = $("#playerNick"),
		playButton = $("#play"),
		chatLog = $("#chatLog"),
		chatMsg = $("#chatMsg");
		
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
				
	function startGame() {
		if (game.isReady()) {
			game.debug('Ready! Starting...');
			game.check.isPlaying = true;
			//game.canvas.focus();
							
			$(window).keydown(function(e) { //keypress? FIXME switch?
				//e.preventDefault();
				
				var keyCode = e.keyCode;
				
				if (!game.player.isChatting) {
					if (keyCode == arrowLeft) {
						game.player.moveLeft = true;
					} else if (keyCode == arrowRight) {
						game.player.moveRight = true;
					} else if (keyCode == arrowUp) {
						game.player.moveUp = true;
					} else if (keyCode == arrowDown) {
						game.player.moveDown = true;
					}
				}
				
				if (keyCode == keyTab) { //TODO: fix animation loop
					e.preventDefault();
					showPlayersList();
				}
			});
			
			$(window).keypress(function(e) {
				//e.preventDefault();
				
				var keyCode = e.keyCode;
			
			});

			$(window).keyup(function(e) {
				//e.preventDefault();
				
				var keyCode = e.keyCode;
				
				if (!game.player.isChatting) {
					if (keyCode == arrowLeft) {
						game.player.moveLeft = false;
					} else if (keyCode == arrowRight) {
						game.player.moveRight = false;
					} else if (keyCode == arrowUp) {
						game.player.moveUp = false;
					} else if (keyCode == arrowDown) {
						game.player.moveDown = false;
					}
				}
			
				game.player.vX = 0; //FIXME useless?
				game.player.vY = 0;
				
				if (keyCode == keyTab) {
					//gamePlayersList.stop().fadeOut('fast');
					gamePlayersList.hide();
				} 
				if (keyCode == keyBackslash) {
					$("#debugLog").toggle();
					game.debugCanvas.toggle();
				}
				if (keyCode == keyEnter) {  //on keyEnter if chatMsg has focus -> blur, if not -> give focus
					if (game.check.isPlaying) {
						var focused = $("#chatMsg:focus");
						if (focused != null && focused.length > 0) {
							chatMsg.blur();
						} else {
							chatMsg.focus();
						}
					}
				}
			});
			
			chatMsg.bind('keypress', function(e) {//FIXME test
										if (e.keyCode == keyEnter) {
										
											var msg = chatMsg.val();
											if (msg != '') {
												chatMsg.val('');
												game.socket.emit('chatMsg', { id: game.player.id, msg: msg });
											}
										}
									});
			
			nowMove = (new Date()).getTime();
			
			game.fps.init('fps');
			game.fps.timer = setInterval(function() { game.fps.update(); }, 2000); //FIXME damn you setInterval
			game.initTick();
			
			chatMsg.attr('disabled', false);
			$('#bgm-ambient1').get(0).play(); //test
			
			//effe(); FIXME works better than fps.js
			gameLoop();
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
	}
		
	function resizeCanvas() {
		//width is 95% of the page and a multiple of tileWidth
		var roughWidth = Math.floor($(window).width() * 0.95);		
		var roughHeight = Math.floor($(window).height() * 0.95) - 110; //- debugcanvas + padding
		var newWidth = Math.floor(roughWidth / game.serverConfig.tileWidth) * game.serverConfig.tileWidth;
		var newHeight = Math.floor(roughHeight / game.serverConfig.tileHeight) * game.serverConfig.tileHeight;
		
		game.canvasWidth = newWidth;
		game.canvasHeight = newHeight;
			
		game.canvas.attr("width", game.canvasWidth);
		game.canvas.attr("height", game.canvasHeight);
		
		game.vp.resize(game.canvasWidth, game.canvasHeight);
		
    	game.ctx.font = "15px Monospace"; //workaround FIXME
    	
    	chatMsg.width(newWidth - (chatMsg.outerWidth() - chatMsg.width())); // - (2 * css border + 2 * padding)
    	chatLog.offset({ left: (game.canvas.offset().left + game.canvasWidth - chatLog.outerWidth()) });
	}
	
	function sendNickname() {
		game.debug('Clicked Play');

		if (game.check.isConnected) {
			if (playerNick.val() != '') { //TODO do other checks (server auth on nick)
				game.player.nick = playerNick.val();
			}
			game.debug('Player name set: '+ game.player.nick);

			gameIntro.fadeOut();
	
			if (!game.check.hasNick) { //TODO: keep gameUI form open till nick is ok
				game.debug('Sending nickname');
				game.socket.emit('setNick', { id: game.player.id, nick: game.player.nick });
			}
			startGame(); //start the game only if connected
		} else {
			game.debug('You cannot play until you are connected to the server.');
			//FIXME set a timer to autorestart?
		}
	}
	
	var game; //main game handle
	
	function gameInit() {
		game = new Game();
		game.initVars();
		game.world = new Map(game); //FIXME need to solve this
		game.vp = new Viewport(game, game.canvasWidth, game.canvasHeight);
		game.socket = new Socket(game);
		game.fps = new Fps(game);
		game.player = new Player(); //FIXME received server configs? (hardcoded stuff)
		
		$(window).resize(resizeCanvas);
		resizeCanvas();
		
		playButton.bind('click', sendNickname);
		playerNick.bind('keypress', function(e) {
			if (e.keyCode == keyEnter) {
				sendNickname();
			}
		});
		playerNick.focus(function() {
			if (this.value == this.defaultValue) {
				this.select();
			}
		});	
		playerNick.focus();
		chatMsg.attr('disabled', true);
		
		chatMsg.focus(function() {
			game.player.isChatting = true;
		});	
		chatMsg.blur(function() {
			game.player.isChatting = false;
		});	
		
		game.debug('Game inited.');
	}
	
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
	
	var nowMove,
		allowSendEvery = 50; //TODO: tune this, 1/16s
	
	function sendMovement() {	
		if (game.player.hasMoved()) { //player moved. Use player.sendupdate?
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
			if ((nowMove - game.player.lastMove) > allowSendEvery) { 
				//game.debug('5. '+ (nowMove - game.player.lastMove));
				game.socket.emit('play', { id: game.player.id, dir: dir });
				
				game.player.lastMove = Date.now();
			}
			//game.debug('4. '+nowMove+'-'+game.player.lastMove+'='+ (nowMove - game.player.lastMove) +'('+ allowSendEvery +')');
		}
	}
	
	function gameLoop() {
		game.ctx.clearRect(0, 0, game.canvasWidth, game.canvasHeight);
		
		if (game.check.isPlaying) {			
			sendMovement();						
			//game.ctx.fillRect((game.canvasWidth/2) -1, (game.canvasHeight/2) -1, 3, 3);
			//checkBounds(game.player);
			
			game.vp.centerOn(game.player);
			game.world.drawAll();

			game.debugStuff();
			
			//lastFps = (new Date()).getTime();
			game.fps.count++;
			game.tick_count++;

			setTimeout(gameLoop, 30); //test! - 1000/desired_fps
		}
	}
	
	/*var efpiesTimeout,
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
			}, 2000);
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
	}*/
	
	/*
	* Everything starts here
	*/
	
	gameInit();	
	
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
    	if (!game.check.hasQuitted) { //TODO improve hasQuitted usage
		   	game.check.isConnected = true;
			playButton.removeClass("disconnected");
			playButton.html('Play');
			game.debug('* Connected to the server.');
		} else {
			game.socket.disconnect();
			game.debug('* * * You must refresh the page to join the server.');
		}
	});
			
	game.socket.on('disconnect', function() {
		game.check.isConnected = false;
		game.check.isPlaying = false;
		game.check.hasQuitted = true;
		playButton.addClass("disconnected");
		game.debug('* Disconnected from the server.');
		game.chatMessage('* You have been disconnected from the server.');	
	});
	
	game.socket.on('ping', function(data) {
		game.socket.emit('pong', { time: Date.now() });
		//game.debug('Ping? Pong!');
	});
	
	game.socket.on('pingupdate', function(data) {
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				p.ping = data.ping;
				if (p.id == game.player.id) {
					game.player.ping = data.ping;
				}
			}
		});
	});
	
	game.socket.on('info', function(data) {
		game.debug(data.msg);
		game.chatMessage('# '+ data.msg);	
	});
	
	game.socket.on('config', function(data) {						
		game.serverConfig.maxPlayers = data.config.maxPlayers;
		game.serverConfig.speed = data.config.speed;
		game.serverConfig.spawnX = data.config.spawnX;
		game.serverConfig.spawnY = data.config.spawnY;
		game.serverConfig.tileMapWidth = data.config.tileMapWidth;
		game.serverConfig.tileMapHeight = data.config.tileMapHeight;
		game.serverConfig.tileWidth = data.config.tileWidth;
		game.serverConfig.tileHeight = data.config.tileHeight;
		game.serverConfig.pixelMapWidth = data.config.pixelMapWidth;
		game.serverConfig.pixelMapHeight = data.config.pixelMapHeight;
		
		game.debug('Server config received.');
		game.check.hasConfig = true;	
	});
	
	game.socket.on('play', function(data) {
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				p.x = data.x;
				p.y = data.y;
				if (p.id == game.player.id) {
					game.player.x = data.x;
					game.player.y = data.y;
				}
				//game.debug(p.id +' moved to '+ p.x +':'+ p.y +' ('+ Math.floor(p.x / game.serverConfig.tileWidth) +':'+ Math.floor(p.y / game.serverConfig.tileHeight) +')');
			}
		});
	});
	
	game.socket.on('join', function(data) {						
		game.player.id = data.player.id;
		game.player.nick = data.player.nick;
		game.player.x = data.player.x;
		game.player.y = data.player.y;
		
		game.check.hasId = true;
		game.debug('Received current player id: '+ game.player.id);
		game.debug('You have joined the server. ');
	});
	
	game.socket.on('quit', function(data) {
		var quitter,
			i = 0;
	
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				quitter = new Player();
				quitter = p;
				game.players.splice(i, 1);
			}
			i++;
		});
		
		game.debug('Player quitted: '+ quitter.nick +' (id '+ quitter.id +')');
		game.chatMessage('< '+ quitter.nick +' has left the server.');
	});
	
	game.socket.on('nickRes', function(data) {		
		if (data.res) {
			game.check.hasNick = true;
			game.debug('Nick confirmed.');
		} else { //TODO: reopen input form
			game.check.hasNick = false;
			game.debug('Nick not usable.');
		}
	});
	
	game.socket.on('nickChange', function(data) {
		var oldNick = '';
						
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				oldNick = p.nick;
				p.nick = data.nick;
				if (game.player.id == data.id) {
					game.player.nick = data.nick;
				}
			}
		});
		game.debug(oldNick +' changed nick to '+ data.nick);
		game.chatMessage('* '+ oldNick +' changed nick to '+ data.nick +'.');	
	});
	
	game.socket.on('newPlayer', function(data) {	
		var newPlayer = new Player();
		newPlayer.id = data.player.id;
		newPlayer.nick = data.player.nick;
		newPlayer.x = data.player.x;
		newPlayer.y = data.player.y;
	
		game.players.push(newPlayer);
		game.debug('New player joined: '+ newPlayer.nick);
		game.chatMessage('> '+ newPlayer.nick +' has joined the server.');
		
		$("#sfx-newPlayer").get(0).play();
	});
	
	game.socket.on('list', function(data) {				
		game.players = []; //prepare for new list
		game.debug('Received initial player list.');

		data.list.forEach(function(p) {			
			var tmpPlayer = new Player();
			tmpPlayer.id = p.id;
			tmpPlayer.nick = p.nick;
			tmpPlayer.x = p.x;
			tmpPlayer.y = p.y;
			tmpPlayer.ping = p.ping;
			
			game.players.push(tmpPlayer);
		});

		game.debug('Player list received: '+ data.list.length +' players.');
		game.check.hasPlayerList = true;		
	});
	
	game.socket.on('chatMsg', function(data) {	
		var sender;
		
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				sender = new Player();
				sender = p;
			}
		});
				
		game.chatMessage('<strong>'+ sender.nick +'</strong>: '+ data.msg);	
	});
	
	game.socket.on('chatAction', function(data) {		
		game.chatMessage('* <em>'+ data.msg +'</em>');	
	});
			
	game.socket.on('message', function(data) { //forever alone
		game.debug('Message arrived: '+ data);		
		
		switch (data.type) {					
			default:
				game.debug('[Error] Unknown message type: '+ json(data) +'.');
			break;
		}
	});
});
