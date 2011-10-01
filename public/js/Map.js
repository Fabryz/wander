/*
* Managing map
*/

var Map = function(game) {
	this.game = game; //main game handle
	this.name = "Village #001";
	this.ts = new Tileset(game);
	this.map = this.loadMap();
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
			 [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
			 [0, 0, 0, 40, 0, 37, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
			 [0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 44, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0],
			 [0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0],
			 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

	if (this.game) {
		this.game.debug('Map "'+ this.name +'" loaded.');
	}
	
	return map;
};

Map.prototype.clearTile = function(x, y) {
	this.game.ctx.clearRect(x * this.game.serverConfig.tileWidth, y * this.game.serverConfig.tileHeight, this.game.serverConfig.tileWidth, this.game.serverConfig.tileHeight);
};

Map.prototype.drawTile = function(tileId, tileX, tileY, tileWidth, tileHeight) {	    		
	try {
    	 this.game.ctx.drawImage(this.ts.images[tileId], tileX, tileY, tileWidth, tileHeight);

		//> DEBUG
		/*this.game.ctx.save();					
		this.game.ctx.fillStyle = 'red';

		var walkable = this.ts.tileset[tileId].walkable;
		this.game.ctx.fillText(x +':'+ y, tileX, tileY + 10);

		if (!walkable) {
			this.game.ctx.fillStyle = 'blue';
			this.game.ctx.fillText(walkable, tileX, tileY + 25);
		}

		this.game.ctx.restore();*/
		//< DEBUG
    } catch(err) {
        this.game.debug('Error while drawing tile ['+ tileX +']['+ tileY +']: '+ err);
        console.log('Error while drawing tile ['+ tileX +']['+ tileY +']: '+ err);
    	this.game.check.isPlaying = false; //force the game to stop
    }
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
	        		isInside = this.game.vp.isInside(drawX, drawY),
	        		width = this.game.serverConfig.tileWidth,
					height = this.game.serverConfig.tileHeight;
	        	
	        	// render only tiles inside current viewport + border all around
	        	// depending on window width/height the first row/col could be cut
	        	// away from rendering, so render (at least) 1 more row/col for safety
	        	if (isInside) {
					var tileId = this.map[z][y][x];
					
					if (tileId != 0) { //if not blank
						var tile = this.ts.tileset[tileId];
						
						//render tiles with height > default tile height
						if (typeof tile.extra !== 'undefined') { //TODO reassign also X vars //edit: what?
							if (typeof tile.extra.multi !== 'undefined') {
								var tileHeight =  this.ts.images[tileId].height;
								
					    		drawY = drawY - (tileHeight - height);
					    		height = tileHeight; 
					    	}
					    }

					    this.drawTile(tileId, drawX, drawY, width, height);
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

Map.prototype.clearAll = function() {
	this.game.ctx.clearRect(0, 0, this.game.canvasWidth, this.game.canvasHeight);
};

Map.prototype.drawAll = function() {
	this.drawMapBounds();
	this.drawMap();
};

if (typeof exports !== 'undefined') exports.loadMap = Map.prototype.loadMap;
