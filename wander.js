/*
* Author: Fabrizio Codello
* Date: 2011/05/1
* Version: 0.3.4
*
* TODO:
*		+browser compatibility Chrome, FF, IE(?)
*       ?move only on mod TILE_WIDTH, animation
*       optimize drawmap: render only viewable
*       *collision with walls (rewrite moveCanvas/movePlayer)
*       check clear canvas on player
*       ?wall outer shadows
*       dirty tiles to re-render
*
*/

var socket,
	vp,
    canvas,
    gui,
    debug = $('#debug'),
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    old_canvas_pos_left,
    old_canvas_pot_top,
    canvas_pos,
    d = {},
    id = 0,
    UPKEY = 38,
    DOWNKEY = 40,
    LEFTKEY = 37,
    RIGHTKEY = 39,
    VP_WIDTH = 300,
    VP_HEIGHT = 300,
    VP_WIDTH_HALF = VP_WIDTH/2,
    VP_HEIGHT_HALF = VP_HEIGHT/2,
    player,
    player_x_tile,
    player_y_tile,
    tileset = {},
    TILE_WIDTH = 32,
    TILE_HEIGHT = 32,
    H_TILES,
    V_TILES,
    ctx, 
    ctxgui,
    map = [],
    fps_last,
    isOver,
    last_safe_move = [];

function Player() {
    this.id = 0;
    this.x = 0;
    this.y = 0;
    this.speed = 8;
    this.avatar = new Image();
    this.avatar.src = './img/player.png'; //xHKXL HQ48x BBx6z 48x39
    this.width = TILE_WIDTH;
    this.height = TILE_HEIGHT; 
    
    this.toString = function() {
        return 'id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+')';
    };
        
    this.draw = function(c) {
        c.drawImage(this.avatar, this.x, this.y, this.width, this.height);
    };
}

function fps() { 
    var fps_current = new Date();
    var fps_final = 1000 / (fps_current - fps_last);
    fps_last = fps_current;
    
    return Math.floor(fps_final);
}

function loadTileset() {
    tileset = [{ id: 0,
             name: 'empty',
             src: '',
             block: false
            }, { id: 1,
             name: 'defaultx',
             src: './img/default.png',
             block: false
            }, { id: 2,
             name: 'grass',
             src: './img/grass.png',
             block: false
            }, { id: 3,
             name: 'rock',
             src: './img/rock.png',
             block: true
            }, { id: 4,
             name: 'A',
             src: './img/A.png',
             block: false
            }, { id: 5,
             name: 'B',
             src: './img/B.png',
             block: false
            }, { id: 6,
             name: 'C',
             src: './img/C.png',
             block: false
            }];
}

/*function generateMap() {
    var edge = CANVAS_WIDTH - 64;
    ctx.save();
    ctx.fillRect(32, 32, 32, 32);
    ctx.fillRect(edge, edge, 32, 32);
    ctx.fillRect(edge, 32, 32, 32);
    ctx.fillRect(32, edge, 32, 32);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(CANVAS_WIDTH/2-16, CANVAS_HEIGHT/2-16, 32, 32);
    ctx.restore();
}*/

function loadMap() {
    //15x15tiles = 480x480px
    map[0] = [[2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
             [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]];
    map[1] = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
             [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0], 
             [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
}

function drawMap() { //optimize
    var layers = map.length;
    
    for(var z = 0; z < layers; z += 1) {
        for(var y = 0; y < V_TILES; y += 1) {
            for(var x = 0; x < H_TILES; x += 1) {
                var img = new Image();
                var src = tileset[map[z][y][x]].src;
                //debug.prepend(JSON.stringify(src) + '<br/>');
                
                try {
                    if (src !== '') {
                        img.src = src;
                        ctx.drawImage(img, x*TILE_WIDTH, y*TILE_HEIGHT);
                    } //else leave transparent
                } catch (err) {
                    console.log(err);
                    alert('drawMap(): '+ err);
                }
            }
        }
    }
    
    //generateMap();
}

function moveCanvas(v, a, b, dir) {
    var n = parseInt(v, 10) + (d[a] ? player.speed : 0) - (d[b] ? player.speed : 0);
    
    if (dir) { //true == horizontal
        return (n > VP_WIDTH_HALF - player.width/2 ? VP_WIDTH_HALF - player.width/2 : (n < -(CANVAS_WIDTH) + VP_WIDTH_HALF + player.width/2 ? -(CANVAS_WIDTH) + VP_WIDTH_HALF + player.width/2 : n));
    } else {
        return (n > VP_HEIGHT_HALF - player.height/2 ? VP_HEIGHT_HALF - player.height/2 : (n < -(CANVAS_HEIGHT) + VP_HEIGHT_HALF + player.height/2 ? -(CANVAS_HEIGHT) + VP_HEIGHT_HALF + player.height/2 : n));
    }
}

function moveVP() {
    canvas.css({
        left: function(i, v) { 
                  old_canvas_pos_left = parseInt(v, 10);
                  return moveCanvas(v, LEFTKEY, RIGHTKEY, true); 
        },
        top: function(i, v) {
                  old_canvas_pos_top = parseInt(v, 10);
                  return moveCanvas(v, UPKEY, DOWNKEY, false);
        }
    });
    canvas_pos = canvas.position();
}

function drawGUI() {
    ctxgui.clearRect(0, 0, gui.width(), gui.height());
    ctxgui.fillText('canvas_x: '+ canvas_pos.left +' canvas_y: '+ canvas_pos.top, 10, 20);
    ctxgui.fillText('center_x: '+ (VP_WIDTH_HALF - canvas_pos.left) +' center_y: '+ (VP_HEIGHT_HALF - canvas_pos.top), 10, 40);
    ctxgui.fillText(player, 10, 60);
    ctxgui.fillText(fps() +'fps', 280, 20);
    //ctxgui.fillText(last_h_move, 280, 40);
    //ctxgui.fillText(last_v_move, 330, 40);
    ctxgui.fillText(player_x_tile +':'+ player_y_tile, 340, 20);
    ctxgui.fillText(isOver, 400, 20);
    //ctx.fillRect(VP_WIDTH_HALF-1, VP_HEIGHT_HALF-1, 2, 2);
}

function isOverTile(p, tile_x, tile_y) {
    if ((player.x >= (tile_x * TILE_WIDTH)) && (player.x < (tile_x + 1) * TILE_WIDTH)) {
        if ((player.y >= (tile_y * TILE_HEIGHT)) && (player.y < (tile_y + 1) * TILE_HEIGHT)) {
            return true;
        }
    }
    return false;
}

function isOverTile2(p, tile_x, tile_y) {
    return ((player_x_tile == tile_x) && (player_y_tile == tile_y));
}

function getLastHMove() {
    if (d[LEFTKEY]) {
        return 'left';
    } else if (d[RIGHTKEY]) {
        return 'right';
    } else {
        return 'N/A';
    }
}

function getLastVMove() {
    if (d[UPKEY]) {
        return 'up';
    } else if (d[DOWNKEY]) {
        return 'down';
    } else {
        return 'N/A';
    }
}

function checkCollisions(p, h_dir, v_dir) {//move canvas on the opposite of lastmove
                            //use last_safe_move[x,y] to store last non blocked pos
    // UL | UR
    // - - -
    // LL | LR

    player_x_tile = Math.floor(player.x / TILE_WIDTH);
    player_y_tile = Math.floor(player.y / TILE_HEIGHT);   
    
    isOver = isOverTile(p, 1, 1);
  
    var t = tileset[map[1][player_x_tile][player_y_tile]].block;
    if (t) {
        if (v_dir == 'up') {
            player.y = TILE_HEIGHT * (player_y_tile + 1) ;
        }
    }
    
    //debug.prepend(JSON.stringify(t) + '<br/>');
    
    return p;
}

function checkBounds(p) {
    p.x = (p.x < 0 ? 0 : (p.x + p.width >= CANVAS_WIDTH ? CANVAS_WIDTH - p.width : p.x ));
    p.y = (p.y < 0 ? 0 : (p.y + p.height >= CANVAS_HEIGHT ? CANVAS_HEIGHT - p.height : p.y ));
    return p;
}

function movePlayer() { //centerPlayer?
    player.x = VP_WIDTH_HALF - canvas_pos.left - player.width/2;
    player.y = VP_HEIGHT_HALF - canvas_pos.top - player.height/2;
    player = checkBounds(player);
    
    var last_h_move = getLastHMove();
    var last_v_move = getLastVMove();
    
    player = checkCollisions(player, last_h_move, last_v_move);
}

function drawPlayer() {
    var old_player_pos_left = VP_WIDTH_HALF - old_canvas_pos_left,
        old_player_pos_top = VP_HEIGHT_HALF - old_canvas_pos_top;
        //player_has_moved = (( old_player_pos_left != player.x) || ( old_player_pos_top != player.y));
    
    //if (player_has_moved) {
        //ctx.clearRect(old_player_pos_left, old_player_pos_top, player.width, player.height); 
        canvas.width(canvas.width);
        player.draw(ctx);
    //}    
}



function gameloop() { //TODO: first move player, then center VP on him
    moveVP();
    drawMap();
    movePlayer();
    drawPlayer();
    drawGUI();
}

function init() {
    vp = $('#viewport');
    canvas = $('#canvas');
    //vp.append('<canvas id="gui" width="500" height="70"></canvas>');
    gui = $('#gui');
    
    debug.append('Game inited');
    


    CANVAS_WIDTH = canvas.width();
    CANVAS_HEIGHT = canvas.height();
    
    vp.width(VP_WIDTH);
    vp.height(VP_HEIGHT);
    
    H_TILES = Math.floor(CANVAS_WIDTH / TILE_WIDTH); //15
    V_TILES = Math.floor(CANVAS_HEIGHT / TILE_HEIGHT); //15
    
    ctx = canvas[0].getContext('2d');
    ctxgui = gui[0].getContext('2d');
    
    ctxgui.fillStyle = 'rgb(0, 0, 0)';
    ctxgui.font = "15px Lucida Console";
    
    loadTileset();
    loadMap();
    
    player = new Player();
    //player.x = TILE_WIDTH * 2;
    //player.y = TILE_HEIGHT * 2;
    checkBounds(player);
    player.draw(ctx);
    
    $(window).keydown(function(e) { 
        e.preventDefault(); 
        d[e.which] = true; 
    });
    $(window).keyup(function(e) { 
        e.preventDefault(); 
        d[e.which] = false; 
    });
    
    fps_last = new Date();
    
    setInterval('gameloop()', 30);
}

$(document).ready(function() {
    socket = new io.Socket(null, {port: 8080, rememberTransport: false})
    socket.connect();
    
    debug.prepend(JSON.stringify('asshole') + '<br/>');
    
    socket.on('connect', function() {
		debug.append('<li class="connect">* Connected to the server.</li>');	  	
	});
			
	socket.on('disconnect', function() {
		debug.append('<li class="disconnect">* Disconnected from the server.</li>');
	});
			
	socket.on('message', function(data) {
		var data = JSON.parse(data);
		
		switch (data.msg_type) {
			case 'history':
					debug.append('<li class="history">['+ data.time +'] &lt;'+ data.username +'&gt; '+ data.msg +'</li>');
				break;

	
			default:
					debug.append('<li class="message">['+ data.time +'] &lt;'+ data.username +'&gt; '+ data.msg +'</li>');
				break;
		}				
		
	});		
	
	init();
});
