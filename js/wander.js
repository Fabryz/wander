/*
* Author: Fabrizio Codello
* Date: 2011/06/19
* Version: 0.3.6
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
	
	/*startButton.hide();
	startButton.click(function() {
		$(this).hide();
		stopButton.show();
		
		check.isPlaying = true;
		debugLog.prepend("<li>Started</li>");
		gameLoop();
	});
	
	stopButton.click(function() {
		$(this).hide();
		startButton.show();
		
		check.isPlaying = false;
		debugLog.prepend("<li>Stopped</li>");
	});*/
	
	var tileWidth = 32,
		tileHeight = 32;
	
	function Player(x, y) {
		this.id = -1;
		this.nick = "";
		this.x = x;
		this.y = y;
		this.vX = 0;
		this.vY = 0;
		
		this.alive = true;
		this.status = "normal";
		this.hp = 100;
		this.inventory = [];
		
		this.avatar = new Image();
		this.avatar.src = './img/player.png';
		this.width = tileWidth;
		this.height = tileHeight;
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
		    
		this.draw = function(c) {
		    c.drawImage(this.avatar, this.x, this.y, this.width, this.height);
		    c.fillText(this.nick, this.x + this.halfWidth, this.y - 10);
		};
	}
	
	var arrowUp = 38,
		arrowDown = 40,
		arrowLeft = 37,
		arrowRight = 39;
		
	var gameGUI = $("#gameGUI"),
		gameIntro = $("#gameIntro"),
		playerNick = $("#playerNick"),
		playButton = $("#play");
		
	var json = JSON.stringify;
	
	playButton.click(function() {
		debugLog.prepend("<li>Clicked Play</li>");
		
		if (check.isConnected) {
			if (playerNick.val() != '') {
				player.nick = playerNick.val();
			}
			debugLog.prepend("<li>Player name: "+ player.nick +"</li>");
		
			gameGUI.fadeOut();
			startGame();	//start the game only if connected
		} else {
			debugLog.prepend("<li>You cannot play until you are connected to the server.</li>");
			//set a timer to autorestart?
		}
	});
	
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
	
	//boolean var for every phase of the connection
	var check = {
		isConnected: false,
		hasId: false,
		hasNick: false,
		hasPlayerList: false,
		isReady: false,
		isPlaying: false
	};
	
	var attempt = 0,
		maxAttempts = 5,
		attemptTime = 1000;
			
	function startGame() {
		if (!check.hasNick) { //todo: keep gameUI form open till nick is ok
			debugLog.prepend('<li>Sending nickname</li>');
			socket.send(json({ type: 'setNick', nick: player.nick}));
		}
		if (!check.hasPlayerList) {
			debugLog.prepend('<li>Requesting players list</li>');
			socket.send(json({ type: 'playersList'}));
		}	
		if (check.isReady) {
			debugLog.prepend("<li>Starting...</li>");
			check.isPlaying = true;
							
			$(window).keypress(function(e) {
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
				
				if (playerMoved) {
					player.moved = true;
				}
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
				
				if (playerMoved) {
					player.moved = false;
				}
			
				player.vX = 0;
				player.vY = 0;
			});
			
			//timer();
		} else {
			attempt++;
			if (attempt <= maxAttempts) {
				setTimeout(startGame, attemptTime);
				debugLog.prepend("<li>- - - Not ready, restarting in 5s... (Attempt "+ attempt+")</li>");
			} else {
				check.isPlaying = false;
				debugLog.prepend("<li>- - - Unable to start, game stopped.</li>");
			}
		}
		
		gameLoop();
	}
	
	var player,
		players = [],
		maxPlayers = 10, //get from server
		speed = 5;		//get from server
	
	function init() {		
		socket = new io.Socket(null, {port: 8080, rememberTransport: false});
    	socket.connect();
    	debugLog.prepend("<li>Connecting...</li>");
		
		player = new Player(0, 0);
		players.push(player);	//remove?
				
		ctx.fillStyle = 'rgb(0, 0, 0)';
    	ctx.font = "15px Monospace";
		
		debugCtx.fillStyle = 'rgb(0, 0, 0)';
    	debugCtx.font = "15px Monospace";
		
		debugLog.prepend("<li>Inited.</li>");
	}
	
	/*
	//keep for better interaction?
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
	
	function checkBoundaries(p) {
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
	
	function debugStuff() {
		debugCtx.clearRect(0, 0, 500, 70);
		debugCtx.fillText(player, 10, 15);
		debugCtx.fillText(fps(), 10, 35);
	}
	
	//test
	var lastFps;
		
	function fps() {
			var now = new Date().getTime();
			var fps = 1000/(now - lastFps);
			lastFps = now;
			
			return Math.floor(fps);
	}
	
	function playerMoved() {
		return (player.moveLeft || player.moveRight || player.moveUp || player.moveDown);
	}
	
	var sent,
		lastMove;
	
	// test. Put socket.send back inside .keypress?
	// goddamn this is the hell of lag
	function sendMovement() {	
		if (playerMoved) {	//player moved. Use player.sendupdate?
							//check if position differs from old one?
			var dir;
		
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
		
			//find a way to socket.send only every X ms and not continuosly			
			nowMove = new Date.getTime();
			
			if (nowMove - lastMove > 1000) {
				lastMove = nowMove;
				socket.send(json({ type: 'play', id: player.id, dir: dir }));
			}
		}
	}
	
	function gameLoop() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (check.isPlaying) {
			lastMove = new Date().getTime();
			sendMovement();
			
			//movePlayer(player); using sockets
			checkBoundaries(player);
			
			/*var playersLength = players.length;
			for(var i = 0; i < playersLength; i++) {
				players[i].draw(ctx);
			}*/
			
			debugStuff();
			
			lastFps = new Date().getTime();
			
			setTimeout(gameLoop, 33); //1000/desired_fps
		}
	}
	
	var pingTimeout;
	
	function timer() {	//implement ping/userlist
		if (check.isPlaying) {
			pingTimeout = setTimeout(function() {
				//ping every X seconds?
		
				timer();
			}, 5000);
		}
	}
		
	debugLog.click(function() {
		debugLog.html("");
	});
	
	init();
	
	/* 
	* Multiplayer stuff	
	*/
	
	var socket;
	
	function movePlayerSocket(p, dir) {
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
	}
	    
    socket.on('connect', function() {
    	check.isConnected = true;
    	playButton.removeClass("disconnected");
		debugLog.prepend('<li>* Connected to the server.</li>');
	});
			
	socket.on('disconnect', function() {
		check.isConnected = false;
		check.isReady = false;
		check.isPlaying = false;
		playButton.addClass("disconnected");
		debugLog.prepend('<li>* Disconnected from the server.</li>');
	});
			
	socket.on('message', function(mess) {
		var data = JSON.parse(mess);
		
		//debugLog.prepend('<li>Message arrived: '+ mess +'</li>');		
		
		switch (data.type) {
				case 'info':
						debugLog.prepend('<li>'+ data.msg +'</li>');	
					break;
				case 'play':	//use players[id]
						players.forEach(function(pla) {
							if (pla.id == data.id) {
								movePlayerSocket(pla, data.dir);
							}
						});
						//check.isPlaying = true;
						//movePlayerSocket(players[data.id], data.dir);
					break;
				case 'join':
						var tmpPlayer = JSON.parse(data.player);
						
						player = tmpPlayer;
						check.hasId = true;
						debugLog.prepend('<li>Received current player id: '+ tmpPlayer.id +'</li>');
					break;
				case 'nickRes':
						if (data.res == 'ok') {
							check.hasNick = true;
							debugLog.prepend('<li>Nick confirmed.</li>');
						} else { //reopen input form
							check.hasNick = false;
							debugLog.prepend('<li>Nick not usable.</li>');
						}
					break;
				case 'newPlayer':
						var tmpPlayer = JSON.parse(data.player);
						
						if (tmpPlayer.id != player.id) {
							players[tmpPlayer.id] = tmpPlayer;
							debugLog.prepend('<li>New player joined: '+ json(tmpPlayer) +'</li>');					}
					break;
				case 'playersList': //check for empty list?
						debugLog.prepend('<li>Receiving players list...</li>');				
						players = []; //prepare for new list
						var playerList = JSON.parse(data.list);
					
						debugLog.prepend('<li>Received: '+ data.list +'</li>');
					
						/*playerList.forEach(function(p) {
							debugLog.prepend('<li>INSIDE FOREACH</li>');				
							var tmpPlayer = JSON.parse(p);
				
							//tmpPlayer.id = data.id;
							//tmpPlayer.nick = data.nick;
							//tmpPlayer.x = data.x;
							//tmpPlayer.y = data.y;
				
							players.push(tmpPlayer);
							debugLog.prepend('<li>Added player '+ tmpPlayer.nick +' to list</li>');				
						});
						for(var i = 0; i < playerList.length; i++) {
							var tmpPlayer = playerList[i];
						}
						
						*/
						
						playerList.forEach(function(p) {
							debugLog.prepend('<li>Added player '+ p.nick +' to list</li>');				
				
						});
	
						debugLog.prepend('<li>Player list received.</li>');
						check.hasPlayerList = true;	
						check.isReady = true;			
				break;
					
				default:
					debugLog.prepend('<li>[Error] Unknown message type: '+ data.type +'.</li>');
				break;
		}
		
			
		
	});
});
