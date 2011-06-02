/*
* Author: Fabrizio Codello
* Date: 2011/06/02
* Version: 0.3.6
*
* TODO:	fix player list, fix multiplayer
*		+revise all the code
*		+optimize socket messages
*		+socket send on keypress?
*		socket movement only for who's not the player
*
*		+browser compatibility Chrome, FF, IE(?)
*       ?move only on mod TILE_WIDTH, animation
*       optimize drawmap: render only viewable
*       *collision with walls (rewrite moveCanvas/movePlayer)
*       check clear canvas on player
*       dirty tiles to re-render
*
*/

$(document).ready(function() {
	var canvas = $("#gameCanvas");
	var ctx = canvas.get(0).getContext("2d");
		
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	var playGame = false,
		desiredFPS = 30;
	
	var startButton = $("#startAnimation"),
		stopButton = $("#stopAnimation");
		
	var debugCanvas = $("#debugCanvas"),
		debugCtx = debugCanvas.get(0).getContext("2d"),
		debugLog = $("#debugLog ul");
	
	startButton.hide();
	startButton.click(function() {
		$(this).hide();
		stopButton.show();
		
		playGame = true;
		debugLog.prepend("<li>Started</li>");
		animate();
	});
	
	stopButton.click(function() {
		$(this).hide();
		startButton.show();
		
		playGame = false;
		debugLog.prepend("<li>Stopped</li>");
	});
	
	//var playersId = 0;
	
	var tileWidth = 32,
		tileHeight = 32;
	
	function Player(x, y) {
		this.id = 0;
		this.nick = "Guest"+0;
		this.x = x;
		this.y = y;
		
		this.width = tileWidth;
		this.height = tileHeight;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2; 
		
		this.vX = 0;
		this.vY = 0;		
		
		this.avatar = new Image();
		this.avatar.src = './img/player.png';
		
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
		buttonPlay = $("#play");
	
	buttonPlay.click(function() {
		debugLog.prepend("<li>Clicked Play</li>");
		
		if (playerNick.val() != '') {
			player.nick = playerNick.val();
		}
		debugLog.prepend("<li>Player name: "+ player.nick +"</li>");
		
		gameGUI.hide();
		startGame();
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
	
	function startGame() {
		//dostuff
		if (connected) {
			debugLog.prepend('<li>Requesting new player id</li>');
			socket.send(JSON.stringify({ type: 'newPlayer', nick: player.nick}));
			debugLog.prepend('<li>Requesting player list</li>');
			socket.send(JSON.stringify({ type: 'playersList'}));
		}
		
		$(window).keypress(function(e) {
			e.preventDefault();
			var keyCode = e.keyCode;

			if (!playGame) {
				playGame = true;
				
				debugLog.prepend("<li>Starting...</li>");

				//timer();
				animate();
			}
			
			if (keyCode == arrowLeft) {
				player.moveLeft = true;
				dir = 'l';
			} else if (keyCode == arrowRight) {
				player.moveRight = true;
				dir = 'r';
			} else if (keyCode == arrowUp) {
				player.moveUp = true;
				dir = 'u';
			} else if (keyCode == arrowDown) {
				player.moveDown = true;
				dir = 'd';
			}
			
			//testing
			socket.send(JSON.stringify({ type: 'play', id: player.id, x: player.x, y: player.y, dir: dir}));
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
			
			//player.vX = 0;
			//player.vY = 0;
		});
		
		animate();
	}
	
	var player,
		players = [],
		maxPlayers = 10,
		speed = 5,
		connected = false;
	
	function init() {		
		socket = new io.Socket(null, {port: 8080, rememberTransport: false});
    	socket.connect();
    	debugLog.prepend("<li>Connecting...</li>");
		
		player = new Player(0, 0);
		players.push(player);
				
		ctx.fillStyle = 'rgb(0, 0, 0)';
    	ctx.font = "15px Monospace";
		
		debugCtx.fillStyle = 'rgb(0, 0, 0)';
    	debugCtx.font = "15px Monospace";
		
		debugLog.prepend("<li>Inited.</li>");
	}
	
	/*function movePlayer(p) {
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
	}
	
	function animate() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (playGame) {			
			
			//movePlayer(player); using sockets
			checkBoundaries(player);
			
			var playersLength = players.length;
			for(var i = 0; i < playersLength; i++) {
				players[i].draw(ctx);
			}
			
			debugStuff();
			
			setTimeout(animate, 33); //1000/desired_fps
		}
	}
	
	function timer() {	//implement ping/userlist
		if (playGame) {
			scoreTimeout = setTimeout(function() {
				//ping every second?
		
				timer();
			}, 1000);
		}
	}
		
	debugLog.click(function() {
		debugLog.html("");
	});
	
	init();
	
	//Multiplayer stuff	
	var socket;
    
    socket.on('connect', function() {
    	connected = true;
		debugLog.prepend('<li>* Connected to the server.</li>');
	});
			
	socket.on('disconnect', function() {
		connected = false;
		debugLog.prepend('<li>* Disconnected from the server.</li>');
	});
	
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
			
	socket.on('message', function(mess) {
		var data = JSON.parse(mess);
		var msg_type = data.type;
		
		//debugLog.prepend('<li>Message arrived: '+ mess +'</li>');		
		
		switch (msg_type) {
				case 'srv_msg':
						debugLog.prepend('<li>'+ data.msg +'</li>');	
					break;
				case 'play':	//use players[id]
						players.forEach(function(pla) {
							if (pla.id == data.id) {
								movePlayerSocket(pla, data.dir);
							}
						});
					break;
				case 'newPlayer':
						player.id = data.id;
						player.x = data.x;
						player.y = data.y;
						debugLog.prepend('<li>Received player id: '+ data.id +'</li>');
						
					break;
				case 'playersList':
						var tmpPlayer;
						
						tmpPlayer.id = data.id;
						tmpPlayer.nick = data.nick;
						tmpPlayer.x = data.x;
						tmpPlayer.y = data.y;
						
						players.push(tmpPlayer);
						debugLog.prepend('<li>Added player to list</li>');				
				break;
					
				default:
					debugLog.prepend('<li>Unknown message format.</li>');
				break;
		}
		
			
		
	});
});
