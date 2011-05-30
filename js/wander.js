/*
* Author: Fabrizio Codello
* Date: 2011/05/30
* Version: 0.3.6
*
* TODO:
*		+revise all the code
*		+optimize socket messages
*		+socket send on keypress
*		+browser compatibility Chrome, FF, IE(?)
*       ?move only on mod TILE_WIDTH, animation
*       optimize drawmap: render only viewable
*       *collision with walls (rewrite moveCanvas/movePlayer)
*       check clear canvas on player
*       ?wall outer shadows
*       dirty tiles to re-render
*
*/

$(document).ready(function() {
	var canvas = $("#gameCanvas");
	var ctx = canvas.get(0).getContext("2d");
		
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();
	
	var playGame = false,
		desiredFPS = 30
	
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
		debugLog.append("<li>Started</li>");
		animate();
	});
	
	stopButton.click(function() {
		$(this).hide();
		startButton.show();
		
		playGame = false;
		debugLog.append("<li>Stopped</li>");
	});
	
	var playersId = 0;
	
	var tileWidth = 32,
		tileHeight = 32;
	
	function Player(id, x, y) {
		this.id = id;
		this.nick = "Guest"+id;
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
		    return this.nick +' id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+')';
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
		debugLog.append("<li>Clicked Play</li>");
		
		if (playerNick.val() != '') {
			player.nick = playerNick.val();
		}
		debugLog.append("<li>Player name: "+ player.nick +"</li>");
		
		gameGUI.hide();
		startGame();
	});
	
	function startGame() {
		//dostuff
		
		/*canvas.click(function(e) { //testing GUI clicks
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
		});*/
		
		$(window).keydown(function(e) {
			e.preventDefault();
			var keyCode = e.keyCode;

			if (!playGame) {
				playGame = true;
				
				debugLog.append("<li>Starting...</li>");

				//timer();
				animate();
			}
			
			/*if (keyCode == arrowLeft) {
				player.moveLeft = true;
			} else if (keyCode == arrowRight) {
				player.moveRight = true;
			} else if (keyCode == arrowUp) {
				player.moveUp = true;
			} else if (keyCode == arrowDown) {
				player.moveDown = true;
			}*/
			
			if (keyCode == arrowLeft) {
				dir = 'l';
			} else if (keyCode == arrowRight) {
				dir = 'r';
			} else if (keyCode == arrowUp) {
				dir = 'u';
			} else if (keyCode == arrowDown) {
				dir = 'd';
			}
			
			//testing
			socket.send(JSON.stringify({ x: player.x, y: player.y, dir: dir}));
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
		});
		
		animate();
	}
	
	var player,
		players = new Array(),
		maxPlayers = 10,
		speed = 5;
	
	function init() {		
		socket = new io.Socket(null, {port: 8080, rememberTransport: false});
    	socket.connect();
    	debugLog.append("<li>Connecting...</li>");
		
		player = new Player(playersId, 0, 0);
		players.push(player);
		
		ctx.fillStyle = 'rgb(0, 0, 0)';
    	ctx.font = "15px Lucida Console";
		
		debugCtx.fillStyle = 'rgb(0, 0, 0)';
    	debugCtx.font = "15px Lucida Console";
		
		debugLog.append("<li>Inited.</li>");
	}
	
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
	
	var i = 0;
	
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
	
	function timer() {
		if (playGame) {
			scoreTimeout = setTimeout(function() {
				//ping every second?
		
				timer();
			}, 1000);
		}
	}
	
	init();
	
	//Multiplayer stuff	
	var socket;
    
    socket.on('connect', function() {
		debugLog.append('<li>* Connected to the server.</li>');
	});
			
	socket.on('disconnect', function() {
		debugLog.append('<li>* Disconnected from the server.</li>');
	});
			
	socket.on('message', function(mess) {
		var data = JSON.parse(mess);
		
		var dir = data.dir;
		if (dir = 'l') {
			p.vX = -speed;
		}
		if (dir = 'r') {
			p.vX = speed;
		}
		if (dir = 'u') {
			p.vY = -speed;
		}
		if (dir = 'd') {
			p.vY = speed;
		}
		
		p.x += p.vX;
		p.y += p.vY;
		
		//debugCtx(data, 10, 35);
		
		/*switch (data.msg_type) {
			case 'test':
					
				break;

			default:
					
				break;
		}*/				
		
	});
	
	debugLog.click(function() {
		debugLog.html("");
	});
});
