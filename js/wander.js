/*
* Author: Fabrizio Codello
* Date: 2011/05/29
* Version: 0.3.5
*
* TODO:
*		+learn from RobHawkes, revise all the code
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
		    return 'id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+')';
		};
		    
		this.draw = function(c) {
		    c.drawImage(this.avatar, this.x, this.y, this.width, this.height);
		};
	}
	
	var arrowUp = 38,
		arrowDown = 40,
		arrowLeft = 37,
		arrowRight = 39;
	
	function startGame() {
		//dostuff
		
		$(window).keydown(function(e) {
			e.preventDefault();
			var keyCode = e.keyCode;

			if (!playGame) {
				playGame = true;
				
				debugLog.append("<li>Starting...</li>");

				//timer();
				animate();
			}
			
			if (keyCode == arrowLeft) {
				player.moveLeft = true;
			} else if (keyCode == arrowRight) {
				player.moveRight = true;
			} else if (keyCode == arrowUp) {
				player.moveUp = true;
			} else if (keyCode == arrowDown) {
				player.moveDown = true;
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
		});
		
		animate();
	}
	
	var player,
		players = [],
		speed = 5;
	
	function init() {		
		socket = new io.Socket(null, {port: 8080, rememberTransport: false});
    	socket.connect();
    	debugLog.append("<li>Connecting...</li>");
		
		player = new Player(playersId, 0, 0);
		
		debugLog.append("<li>Inited.</li>");
		
		//put a button to start
		startGame();
	}
	
	function movePlayer(p) {
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
	
	function debugStuff() {
		//debugCtx.filltext(player, 10, 10);
	}
	
	var i = 0;
	
	function animate() {
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		if (playGame) {
			
			
			
			movePlayer(player);
			player.draw(ctx);
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
		
		/*switch (data.msg_type) {
			case 'test':
					
				break;

			default:
					
				break;
		}*/				
		
	});
});
