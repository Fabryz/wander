/*
* Managing map and tileset
*/

var Tile; Tile = Tile || require('./Tile.js').Tile;  //for the shared code

var Map = function(game) {
	this.game = game; //main game handle
	this.name = "Village #001";
	this.tileset = this.loadTileset();
	this.map = this.loadMap();
	this.images = this.preloadImages();
};

Map.prototype.loadTileset = function() {
	var ts = [];
		
	ts.push(new Tile(0, 'blank', '', true));
	ts.push(new Tile(1, 'default', './img/X.png', true));
	ts.push(new Tile(2, 'grass', './img/grass.png', true));
	ts.push(new Tile(3, 'rock', './img/rock.png', false));
	ts.push(new Tile(4, 'A', './img/A.png', true));
	ts.push(new Tile(5, 'B', './img/B.png', false));
	ts.push(new Tile(6, 'C', './img/C.png', true));
	ts.push(new Tile(7, 'Wooden floor 1', './img/floor_wood1.png', true));
	ts.push(new Tile(8, 'Wooden floor 2', './img/floor_wood2.png', true));
	ts.push(new Tile(9, 'Wooden floor 3', './img/floor_wood3.png', true));
	ts.push(new Tile(10, 'Wooden floor 4', './img/floor_wood4.png', true));
	ts.push(new Tile(11, 'Wooden floor 5', './img/floor_wood5.png', true));
	ts.push(new Tile(12, 'Wooden floor 6', './img/floor_wood6.png', true));
	ts.push(new Tile(13, 'decent grass 1', './img/grass1.png', true));
	ts.push(new Tile(14, 'decent grass 2', './img/grass2.png', true));
	ts.push(new Tile(15, 'decent grass 3', './img/grass3.png', true));
	ts.push(new Tile(16, 'decent grass 4', './img/grass4.png', true));
	ts.push(new Tile(17, 'decent grass 5', './img/grass5.png', true));
	ts.push(new Tile(18, 'decent grass 6', './img/grass6.png', true));
	ts.push(new Tile(19, 'decent grass 7', './img/grass7.png', true));
	ts.push(new Tile(20, 'decent grass 8', './img/grass8.png', true));
	ts.push(new Tile(21, 'decent grass 9', './img/grass9.png', true));
	ts.push(new Tile(22, 'decent grass 10', './img/grass10.png', true));
	ts.push(new Tile(23, 'decent grass 11', './img/grass11.png', true));
	ts.push(new Tile(24, 'decent grass 12', './img/grass12.png', true));
	ts.push(new Tile(25, 'decent grass 13', './img/grass13.png', true));
	ts.push(new Tile(26, 'decent grass 14', './img/grass14.png', true));
	ts.push(new Tile(27, 'Tree 1 TL', './img/tree1_1.png', true));
	ts.push(new Tile(28, 'Tree 1 TR', './img/tree1_2.png', true));
	ts.push(new Tile(29, 'Tree 1 UL', './img/tree1_3.png', true));
	ts.push(new Tile(30, 'Tree 1 UR', './img/tree1_4.png', true));
	ts.push(new Tile(31, 'Tree 1 LL', './img/tree1_5.png', true));
	ts.push(new Tile(32, 'Tree 1 LR', './img/tree1_6.png', true));
	ts.push(new Tile(33, 'Tree 1 BL', './img/tree1_7.png', false));
	ts.push(new Tile(34, 'Tree 1 BR', './img/tree1_8.png', false));
	ts.push(new Tile(35, 'Bench 1 L', './img/bench1_left.png', false));
	ts.push(new Tile(36, 'Bench 1 R', './img/bench1_right.png', false));
	ts.push(new Tile(37, 'Fence 1 full', './img/fence1_full.png', false));
	ts.push(new Tile(38, 'Fence 1 T', './img/fence1_top.png', true));
	ts.push(new Tile(39, 'Fence 1 B', './img/fence1_bottom.png', false));
	ts.push(new Tile(40, 'Fence 2 full', './img/fence2_full.png', false));
	ts.push(new Tile(41, 'Fence 2 T', './img/fence2_top.png', true));
	ts.push(new Tile(42, 'Fence 2 B', './img/fence2_bottom.png', false));
	ts.push(new Tile(43, 'Teleport', './img/teleport.png', true, { tx: 15, ty: 9 }));
	
	if (this.game) {
		this.game.debug('Tileset loaded.');
	}
	
	return ts;
};

/*
* Layers:
*
* 4
* 3
* 2 Above tables
* 1 Walls / Obj above ground / Trees foliage
* - Players
* 0 Ground 
*
*/

Map.prototype.loadMap = function() {  //shared between client/server
	var map = [];
		
	map[0] = [[16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 13, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 13, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 17, 18, 19, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 17, 18, 01, 18, 19, 16, 16, 16, 16, 13, 14, 14, 20, 18, 21, 14, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 22, 23, 23, 23, 24, 16, 16, 16, 16, 17, 16, 16, 16, 10, 16, 16, 16, 16, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 7, 16, 7, 16, 9, 8, 7, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 9, 12, 8, 9, 10, 7, 12, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 11, 7, 12, 8, 9, 11, 8, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 12, 8, 10, 7, 11, 12, 10, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 10, 9, 7, 11, 8, 10, 7, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 8, 12, 8, 12, 11, 12, 8, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 10, 8, 12, 8, 9, 11, 7, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 8, 7, 9, 10, 9, 12, 11, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 16, 16, 16, 16, 16, 16, 16, 16, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 1, 16, 2, 16, 16, 16, 4, 16, 5, 16, 6, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 7, 16, 8, 16, 9, 16, 10, 16, 11, 16, 12, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 13, 14, 14, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 17, 18, 43, 18, 19, 20, 21, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 22, 23, 23, 23, 24, 25, 26, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [13, 14, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [17, 16, 21, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [17, 16, 16, 19, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16],
			 [22, 23, 23, 24, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16]];
	map[1] = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0],
			 [0, 3, 0, 41, 0, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
			 [0, 0, 0, 42, 0, 39, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 3, 3, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 35, 36, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 34, 0, 27, 28, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 27, 28, 0, 0, 31, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29, 30, 0, 0, 33, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 31, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 33, 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
			 [0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

	if (this.game) {
		this.game.debug('Map "'+ this.name +'" loaded.');
	}
	
	return map;
};
	
Map.prototype.preloadImages = function() {
	var images = [],
		image = '';
	
	this.tileset.forEach(function(t) {
		if (t.src != '') {
			image = new Image();
			image.src = t.src;
		}
		images.push(image);
	});
	this.game.debug('Images preloaded.');
		
	return images;
};
	
Map.prototype.drawMap = function() {
    var layers = this.map.length,
    	cols = this.map[0].length,
    	rows = this.map[0][0].length;
    
    for(var z = 0; z < layers; z++) {
	    for(var y = 0; y < cols; y++) { //this.game.serverConfig.tileMapHeight
	        for(var x = 0; x < rows; x++) { //this.game.serverConfig.tileMapWidth
	        	var coords = this.mapToVp(0, 0),
	        		drawX = coords.x + x * this.game.serverConfig.tileWidth,
	        		drawY = coords.y + y * this.game.serverConfig.tileHeight,
	        		isInside = this.game.vp.isInside(drawX, drawY);
	        		/*isUborder = this.game.vp.isInside(drawX, drawY + 48),
	        		isDborder = this.game.vp.isInside(drawX, drawY - 48);*/
	        	
	        	// ^ isInside: depending on window width/height the first row/col could be cut
	        	// away from rendering, so render one more row/col for safety
	        	// 1 left up 2 down right
	        	
	        	//render only tiles inside current viewport + 1x border all around
	        	if (isInside) {
					var tileId = this.map[z][y][x],
						width = this.game.serverConfig.tileWidth,
			    		height = this.game.serverConfig.tileHeight;
					
					if (tileId != 0) { //if not blank
					    try {
							this.game.ctx.drawImage(this.images[tileId], drawX, drawY, width, height);
				
							//> DEBUG
							/*this.game.ctx.save();					
							this.game.ctx.fillStyle = 'red';
				
							var walkable = this.tileset[this.map[z][y][x]].walkable;
							this.game.ctx.fillText(x +':'+ y, drawX, drawY + 10);
				
							if (!walkable) {
								this.game.ctx.fillStyle = 'blue';
								this.game.ctx.fillText(walkable, drawX, drawY + 25);
							}

							this.game.ctx.restore();*/
							//< DEBUG
					    } catch(err) {
					        this.game.debug('Error while drawing map['+ z +']['+ y +']['+ x +']: '+ err);
					        console.log(err);
					    	this.game.check.isPlaying = false; //force the game to stop
					    }
			        }
	            }
	        }
	    }
	    //FIXME test player below trees. This code structure is REALLY ugly.
	    //BAWWWWWW DON'T LOOK HERE. This was on gameloop between world.drawAll and debugStuff
		if (z == 0) { //render players above ground (layer 0) but below trees? (layer1)
			this.game.player.draw(this.game); //assume the local copy is more updated		
			var length = this.game.players.length;
			for(var i = 0; i < length; i++) {
				if (this.game.players[i].id != this.game.player.id) {
					this.game.players[i].draw(this.game); //FIXME seriously, stop passing the game handle
		    	}
			}
    	} 
    	if (z == layers - 1) { //FIXME render nicks above everything
			this.game.player.drawNick(this.game);	
			var length = this.game.players.length;
			for(var i = 0; i < length; i++) {
				if (this.game.players[i].id != this.game.player.id) {
					this.game.players[i].drawNick(this.game);
		    	}
			}
    	}
    }
};

Map.prototype.mapToVp = function(x, y) {
	var coords = {};

	coords.x = x - this.game.vp.x;
	coords.y = y - this.game.vp.y;

	//this.game.debug(x +':'+ y +' -> '+ coords.x +':'+ coords.y);

	return coords;
}

Map.prototype.drawMapBounds = function() {
	this.game.ctx.strokeStyle = "#CCC";
	this.game.ctx.lineWidth = 8;

	var coords = this.mapToVp(0, 0);

	this.game.ctx.strokeRect(coords.x, coords.y, this.game.serverConfig.pixelMapWidth, this.game.serverConfig.pixelMapHeight);
};

Map.prototype.drawAll = function() {
	this.drawMapBounds();
	this.drawMap();
};

if (typeof exports !== 'undefined') exports.loadMap = Map.prototype.loadMap;
if (typeof exports !== 'undefined') exports.loadTileset = Map.prototype.loadTileset;
