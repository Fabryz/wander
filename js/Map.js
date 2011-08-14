/*
* Managing map and tileset
*/

var Map = function() {
	this.name = "Village #001";
	this.tileset = this.loadTileset();
	this.map = this.loadMap();
}

function Tile(id, name, src, block) {
	this.id = id;
	this.name = name;
	this.src = src;
	this.block = block;
}

Map.prototype.loadTileset = function() {
	var ts = [];
		
	ts.push(new Tile(0, 'blank', '', false));
	ts.push(new Tile(1, 'default', './img/X.png', false));
	ts.push(new Tile(2, 'grass', './img/grass.png', false));
	ts.push(new Tile(3, 'rock', './img/rock.png', false));
	ts.push(new Tile(4, 'A', './img/A.png', true));
	ts.push(new Tile(5, 'B', './img/B.png', false));
	ts.push(new Tile(6, 'C', './img/C.png', false));

	//debugMsg('Tileset loaded.');
	console.log('Tileset loaded.');
	
	return ts;
}


Map.prototype.loadMap = function() {
	//15x15tiles = 480x480px
	var map = [];
	
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
	console.log('Map '+ this.name +' loaded.');
	return map;
}
	
	
Map.prototype.drawMap = function(ctx) {	//replace with tilemapwidth and tilewidth...
    var layers = this.map.length;
    
    for(var z = 0; z < layers; z++) {
        for(var y = 0; y < 15; y++) {
            for(var x = 0; x < 15; x++) {
                var img = new Image();
                var src = this.tileset[this.map[z][y][x]].src;
                //$('#debug').prepend(JSON.stringify(src) + '<br/>');
                
                console.log(src);
                
                try {
                    if (src !== '') {
                        img.src = src;
                        ctx.drawImage(img, x*32, y*32, 32, 32);	//TODO: calculate where VP is on the map, render accordingly
                    } //else leave transparent
                } catch (err) {
                    //console.log('Error while drawing map: '+ err);
                }
            }
        }
    }
    
}
