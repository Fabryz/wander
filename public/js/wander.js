/*
*  Author: Fabrizio Codello
*  Name: Wander (working name)
*  Description: An HTML5 Canvas + Node.js multiplayer sandbox game
*  Repo: https://github.com/Fabryz/wander
*
*/

$(document).ready(function() {
	var game; //main game handle
		
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
		keyC = 67,
		keyI = 73,
		keyBackslash = 220;
		
	var GUI = $("#GUI"),
		gameIntro = $("#gameIntro"),
		gamePlayersList = $("#gamePlayersList"),
		playerNick = $("#playerNick"),
		playButton = $("#play"),
		chatLog = $("#chatLog"),
		chatMsg = $("#chatMsg"),
		cmdInfo = $("#cmd-info"),
		cmdInv = $("#cmd-inv");
		
	var json = JSON.stringify;
	
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
	
	function pixelToTileX(x) { //FIXME share code
		return Math.floor(x / game.serverConfig.tileWidth);
	}

	function pixelToTileY(y) { //FIXME share code
		return Math.floor(y / game.serverConfig.tileHeight);
	}
	
	// pixel source xy, pixel dest xy, tile range
	function isCloseTo(x1, y1, x2, y2, range) {
		var tileX1 = pixelToTileX(x1),
			tileY1 = pixelToTileY(y1),
			tileX2 = pixelToTileX(x2),
			tileY2 = pixelToTileY(y2);
			
		if ((Math.abs(tileX1 - tileX2) <= range) &&
			(Math.abs(tileY1 - tileY2) <= range)) {
			return true;
		} else {
			return false;
		}
	}
	
	/*function isAlreadyPicked(x, y) {
		var length = game.totalPickupables.length, //max 9 with isClose range 1
			items;

		for(var i = 0; i < length; i++) {
			item = game.totalPickupables[i];
			if ((item.x == x) && (item.y == y)) {
				return true;
			}
		}

		return false;
	}*/
	
	function canvasClick() { // FIXME testing GUI clicks
		GUI.click(function(e) { 
			var canvasOffset = game.canvas.offset(), //FIXME can even remove as it's at 0:0
				canvasX = Math.floor(e.pageX - canvasOffset.left),
				canvasY = Math.floor(e.pageY - canvasOffset.top),
				clickMapX = (canvasX + game.vp.x),
				clickMapY = (canvasY + game.vp.y),
				coords = game.world.mapToVp(clickMapX, clickMapY),
				isInside = game.world.isInside(clickMapX, clickMapY),
				tileX = Math.floor(clickMapX / game.serverConfig.tileWidth),
				tileY = Math.floor(clickMapY / game.serverConfig.tileWidth),
				tilePickupables = [],
				itemsQty = 0;
				
			/*//debug
			console.log('page '+ clickMapX +':'+ clickMapY +' '+ isInside);		
			game.ctx.beginPath();
			game.ctx.arc(canvasX, canvasY, 15, 0, Math.PI * 2, true);
			game.ctx.closePath();
			game.ctx.fill();
			//debug*/
			
			if (isInside) {
				tilePickupables = game.world.checkForPickupable(tileX, tileY);
				itemsQty = tilePickupables.length;
					
				if (isCloseTo(game.player.x, game.player.y, clickMapX, clickMapY, 1)) {
					//console.log(tileX +':'+ tileY +' itemsQty '+ itemsQty);				
					
					if (itemsQty > 0) {
						//if (!isAlreadyPicked(tileX, tileY)) {
							closePickupWindow();
							for(var i = 0; i < itemsQty; i++) {
								$("#pickup #items").append('<li id="items-slot-'+ i +'" class="empty-slot"><img src="'+ game.world.ts.tilesFolder + tilePickupables[i].tile.src +'" title="'+ tilePickupables[i].tile.name  +'" alt="'+ tilePickupables[i].tile.name  +'" /></li>');
							}
							game.pickupables = tilePickupables;
							$("#pickup").show(); // perf: show only if not :visible?
						//}
					}
				} else {
					if (itemsQty > 0) {
						game.chatMessage('* <em>That item is too far to reach.</em>');
					}	
				}
			}
		});
	}
	
	var attempt = 0,
		maxAttempts = 5,
		attemptTime = 1000;
				
	function startGame() {
		if (game.isReady()) {
			game.debug('Ready! Starting...');
			game.check.isPlaying = true;
			//game.canvas.focus();
			
			$("#bottomBar").fadeIn('slow');
			chatMsg.fadeIn('slow');
			chatLog.fadeIn('slow');
			chatMsg.attr('disabled', false);
			
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
				if (keyCode == keyC) {
					if (!game.player.isChatting) {
						togglePlayerStatusWindow();
					}					
				}
				if (keyCode == keyI) {
					if (!game.player.isChatting) {
						toggleInventoryWindow();
					}
				}
				if (keyCode == keyEnter) {  //on keyEnter if chatMsg has focus -> blur, if not -> give focus
					if (game.check.isPlaying) {
						if (!game.player.isChatting) {
							chatMsg.focus();
						} else {
							chatMsg.blur();
						}
					}
				}
			});
			
			chatMsg.bind('keyup', function(e) {
				if (e.keyCode == keyEnter) {
					var msg = chatMsg.val();
					if (msg != '') { //FIXME val.length != 0 ?
						chatMsg.val('');
						game.socket.emit(game.proto.MSG_CHATMSG, { id: game.player.id, msg: msg });
					}
				}
			});
			
			nowMove = (new Date()).getTime();
			
			game.fps.init('fps');
			//game.initTick();
			
			$('#bgm-ambient1').get(0).play(); //test

			canvasClick();
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
		//width is 100% of the page and a multiple of tileWidth (sliding a bit outside window)
		var roughWidth = Math.floor($(window).width()) + game.serverConfig.tileWidth;		
		var roughHeight = Math.floor($(window).height()) - 25 + game.serverConfig.tileHeight; // - 25 chatMsg height
		var newWidth = Math.floor(roughWidth / game.serverConfig.tileWidth) * game.serverConfig.tileWidth;
		var newHeight = Math.floor(roughHeight / game.serverConfig.tileHeight) * game.serverConfig.tileHeight;
		
		game.canvasWidth = newWidth;
		game.canvasHeight = newHeight;
		game.canvas.attr({ width: newWidth, height: newHeight });
		
		game.vp.resize(newWidth, newHeight);
		
    	game.ctx.font = "15px Monospace"; //workaround FIXME
    	
    	GUI.height($(window).height() - $("#header").outerHeight() - chatMsg.outerHeight() - 3); // - header border
    	chatMsg.width($(window).width() - (chatMsg.outerWidth() - chatMsg.width())); // - (2 * css border + 2 * padding)
    	$("#bottomBar").width($(window).width() - chatLog.outerWidth());
	}
	
	function sendNickname() {
		game.debug('Clicked Play');

		if (game.check.isConnected) {
			if ((playerNick.val() != '') &&
				(playerNick.val() !== 'null')) { //TODO do other checks (server auth on nick)
				game.player.nick = playerNick.val();
				
				game.debug('Player name set: '+ game.player.nick);

				gameIntro.fadeOut();
				playerNick.unbind('keyup');
	
				if (!game.check.hasNick) { //TODO: keep gameUI form open till nick is ok
					game.debug('Sending nickname');
					game.socket.emit(game.proto.MSG_NICKSET, { id: game.player.id, nick: game.player.nick });
				}
				startGame(); //start the game only if connected
			}
		} else {
			game.debug('You cannot play until you are connected to the server.');
			//FIXME set a timer to autorestart?
		}
	}
	
	function updatePlayerInfo() {
		$("#playerInfo #pi-nick").html(game.player.nick);
		$("#playerInfo #pi-HP").html(game.player.HP +'%');
		$("#playerInfo #pi-status").html(game.player.status);
		$("#playerInfo #pi-position").html(Math.floor(game.player.x / game.serverConfig.tileWidth) +':'+ Math.floor(game.player.y / game.serverConfig.tileHeight));
		$("#playerInfo #pi-ping").html(game.player.ping +'ms');
	}
	
	function togglePlayerStatusWindow() {
		$("#playerInfo").toggle();
			
		if ($("#playerInfo").is(":visible")) {
			updatePlayerInfo();				
		}
	}
	
	function updateInventory() {
		var length = game.player.inventory.length;
		if (length > 0) {
			$("#inventory #inv").html('');
			
			for(var i = 0; i < length; i++) {
				$("#inventory #inv").append('<li id="inv-slot-'+ i +'" class="empty-slot"><img src="'+ game.world.ts.tilesFolder + game.world.ts.tileset[game.player.inventory[i]].src +'" title="'+ game.world.ts.tileset[game.player.inventory[i]].name  +'" alt="'+ game.world.ts.tileset[game.player.inventory[i]].name  +'" /></li>');
			}
		}
	}
	
	function toggleInventoryWindow() {
		$("#inventory").toggle();
		
		if ($("#inventory").is(":visible")) {
			updateInventory();				
		}
	}
	
	function closePickupWindow() {
		$("#pickup").hide();
		$("#pickup #items").html('');
		game.pickupables = [];
	}
	
	function gameInit() {
		game = new Game();
		game.initVars();
		game.world = new Map(game); //FIXME need to solve this
		game.vp = new Viewport(game, game.canvasWidth, game.canvasHeight);
		game.proto = new Protocol();
		game.socket = new Socket(game);
		game.fps = new Fps(game, 2000);
		game.player = new Player(); //FIXME received server configs? (hardcoded stuff)
		
		$(window).resize(resizeCanvas);
		resizeCanvas();
		
		playButton.bind('click', sendNickname);
		playerNick.bind('keyup', function(e) {
			if (e.keyCode == keyEnter) {
				sendNickname();
			}
		});
		
		chatMsg.attr('disabled', true);
		
		chatMsg.focus(function() {
			game.player.isChatting = true;
		});	
		chatMsg.blur(function() {
			game.player.isChatting = false;
		});	
		
		$("#inventory").draggable({ handle: "h3", containment: "#GUI", scroll: false, stack: "#GUI div" });
		$("#playerInfo").draggable({ handle: "h3", containment: "#GUI", scroll: false, stack: "#GUI div" });
		$("#pickup").draggable({ handle: "h3", containment: "#GUI", scroll: false, stack: "#GUI div" });
		/*$("#commands").selectable({
			selected: function(event, ui) {
				$(ui.selected).siblings().removeClass("ui-selected");
			}
		});*/
		
		for(var i = 0; i < 16; i++) { //TODO grab max inventory slots from server?
			$("#inventory #inv").append('<li id="inv-slot-'+ i +'" class="empty-slot"></li>');
		}
		
		cmdInfo.click(function() {
			togglePlayerStatusWindow();
		});
		
		cmdInv.click(function() {
			toggleInventoryWindow();
		});
		
		$("#pickup #cmd-pickup").click(function() {
			game.socket.emit(game.proto.MSG_PICKUP_ALL, { id: game.player.id, items: game.pickupables });
		
			closePickupWindow();
		});
		
		$("#pickup #cmd-cancel").click(function() {
			closePickupWindow();
		});
		
		$("#GUI #disconnected").click(function() {
			location.reload(true);
		});
		
		game.debug('Game inited.');
		
		gameIntro.fadeIn('slow');
		playerNick.focus();
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
	
	var nowMove,
		allowSendEvery = 75; //TODO: tune this, 1/16s
	
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
				
				game.socket.emit(game.proto.MSG_PLAY, { id: game.player.id, dir: dir });
				
				game.player.lastMove = Date.now();
			}
			//game.debug('4. '+nowMove+'-'+game.player.lastMove+'='+ (nowMove - game.player.lastMove) +'('+ allowSendEvery +')');
		}
	}
	
	function refreshGUI() { //TODO update opened windows, mouse hovered obj...
		if ($("#playerInfo").is(":visible")) {
			updatePlayerInfo();				
		}
	}
	
	/* testing requestAnimFrame */
	
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function(callback, element){
					window.setTimeout(callback, 1000 / game.desiredFPS);
				};
	})();
	
	window.requestTimeout = function(fn, delay) {
		if( !window.requestAnimationFrame      	&& 
			!window.webkitRequestAnimationFrame && 
			!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
			!window.oRequestAnimationFrame      && 
			!window.msRequestAnimationFrame)
				return window.setTimeout(fn, delay);
			
		var start = new Date().getTime(),
			handle = new Object();
		
		function loop(){
			var current = new Date().getTime(),
				delta = current - start;
			
			delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
		};
	
		handle.value = requestAnimFrame(loop);
		return handle;
	};

	window.clearRequestTimeout = function(handle) {
		window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
		window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value)	:
		window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
		window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
		window.msCancelRequestAnimationFrame ? msCancelRequestAnimationFrame(handle.value) :
		clearTimeout(handle);
	};
	
	/* /testing requestAnimFrame */
	
	function gameLoop() {
		game.world.clearAll();
		
		if (game.check.isPlaying) {			
			sendMovement();

			game.vp.centerOn(game.player.x + (game.serverConfig.tileWidth / 2), game.player.y + (game.serverConfig.tileHeight / 2));
			game.world.drawAll();

			refreshGUI();
			
			if (game.debugCanvas.is(":visible")) {
				game.debugStuff();
			}
			
			game.fps.count++;
			//game.tick_count++;

			//setTimeout(gameLoop, 30); //test! - 1000/desired_fps
			requestTimeout(gameLoop, 1000 / game.desiredFPS);
		}
	}

	/*
	* Everything starts here
	*/
	
	gameInit();	
	
	/* 
	* Multiplayer stuff	
	*/
	    
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
		
		gameIntro.hide();
		playerNick.unbind('keyup');
		$("#bottomBar").fadeOut('slow');
		chatMsg.fadeOut('slow');
		chatLog.fadeOut('slow');
		$('#GUI #disconnected').fadeIn('slow');
		
		$('#bgm-ambient1').get(0).pause();
	});
	
	game.socket.on(game.proto.MSG_PING, function(data) {
		game.socket.emit(game.proto.MSG_PONG, { time: Date.now() });
		//game.debug('Ping? Pong!');
	});
	
	game.socket.on(game.proto.MSG_PINGUPDATE, function(data) {
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				p.ping = data.ping;
				if (game.player.id == data.id) {
					game.player.ping = data.ping;
				}
			}
		});
	});
	
	game.socket.on(game.proto.MSG_SERVERINFO, function(data) {
		game.debug('Joined "'+ data.serverName +'" ('+ data.totPlayers +' players)');
		game.chatMessage('<strong># Welcome to "'+ data.serverName +'" server!</strong>');
		game.chatMessage('<strong># There are '+ data.totPlayers +' players online.</strong>');
	});
	
	game.socket.on(game.proto.MSG_SERVERCONFIG, function(data) {						
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
	
	game.socket.on(game.proto.MSG_PLAY, function(data) {
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				p.x = data.x;
				p.y = data.y;
				if (game.player.id == data.id) {
					game.player.x = data.x;
					game.player.y = data.y;
				}
				//game.debug(p.id +' moved to '+ p.x +':'+ p.y +' ('+ Math.floor(p.x / game.serverConfig.tileWidth) +':'+ Math.floor(p.y / game.serverConfig.tileHeight) +')');
			}
		});
	});
	
	game.socket.on(game.proto.MSG_PICKUP_ALL, function(data) {
		var length = game.players.length;
		for(var i = 0; i < length; i++) {
			if (game.players[i].id == data.id) {
			
				var itemsQty = data.items.length;
				for(var y = 0; y < itemsQty; y++) {
					game.world.updateMap(data.items[y].x, data.items[y].y, data.items[y].z);
					game.players[i].inventory.push(data.items[y].tile.id);
					
					if (game.player.id == data.id) {
						game.player.inventory.push(data.items[y].tile.id);
					}
				}
				
				updateInventory();

				game.debug(game.players[i].nick +' picked up '+ itemsQty +' items');
			}
		}
	});
	
	game.socket.on(game.proto.MSG_JOIN, function(data) {						
		game.player.id = data.player.id;
		game.player.nick = data.player.nick;
		game.player.x = data.player.x;
		game.player.y = data.player.y;
		
		game.check.hasId = true;
		game.debug('Received current player id: '+ game.player.id);
		game.debug('You have joined the server. ');
	});
	
	game.socket.on(game.proto.MSG_QUIT, function(data) {
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
	
	game.socket.on(game.proto.MSG_NICKRESPONSE, function(data) {		
		if (data.res) {
			game.check.hasNick = true;
			game.debug('Nick confirmed.');
		} else { //TODO: reopen input form
			game.check.hasNick = false;
			game.debug('Nick not usable.');
		}
	});
	
	game.socket.on(game.proto.MSG_NICKCHANGE, function(data) {
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
	
	game.socket.on(game.proto.MSG_NEWPLAYER, function(data) {	
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
	
	game.socket.on(game.proto.MSG_PLAYERLIST, function(data) {				
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
	
	game.socket.on(game.proto.MSG_CHATMSG, function(data) {	
		var sender;
		
		game.players.forEach(function(p) {
			if (p.id == data.id) {
				sender = new Player();
				sender = p;
			}
		});
				
		game.chatMessage('<strong>'+ sender.nick +'</strong>: '+ data.msg);	
	});
	
	game.socket.on(game.proto.MSG_CHATACTION, function(data) {		
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
