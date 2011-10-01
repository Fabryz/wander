var Tile; Tile = Tile || require('./Tile.js').Tile;  //for the shared code

var Tileset = function(game) {
	this.game = game;
	this.tilesFolder = './img/tiles/';
	this.tileset = this.loadTileset();
	this.images = this.preloadImages();
};

Tileset.prototype.loadTileset = function() {
	var ts = [];
		
	ts[0] = new Tile(0, 'blank', '', true);
	ts[1] = new Tile(1, 'default', 'X.png', true);
	ts[2] = new Tile(2, 'grass', 'grass.png', true);
	ts[3] = new Tile(3, 'rock', 'rock.png', false);
	ts[4] = new Tile(4, 'A', 'A.png', true);
	ts[5] = new Tile(5, 'B', 'B.png', false);
	ts[6] = new Tile(6, 'C', 'C.png', true);
	ts[7] = new Tile(7, 'Wooden floor 1', 'floor_wood1.png', true);
	ts[8] = new Tile(8, 'Wooden floor 2', 'floor_wood2.png', true);
	ts[9] = new Tile(9, 'Wooden floor 3', 'floor_wood3.png', true);
	ts[10] = new Tile(10, 'Wooden floor 4', 'floor_wood4.png', true);
	ts[11] = new Tile(11, 'Wooden floor 5', 'floor_wood5.png', true);
	ts[12] = new Tile(12, 'Wooden floor 6', 'floor_wood6.png', true);
	ts[13] = new Tile(13, 'decent grass 1', 'grass1.png', true);
	ts[14] = new Tile(14, 'decent grass 2', 'grass2.png', true);
	ts[15] = new Tile(15, 'decent grass 3', 'grass3.png', true);
	ts[16] = new Tile(16, 'decent grass 4', 'grass4.png', true);
	ts[17] = new Tile(17, 'decent grass 5', 'grass5.png', true);
	ts[18] = new Tile(18, 'decent grass 6', 'grass6.png', true);
	ts[19] = new Tile(19, 'decent grass 7', 'grass7.png', true);
	ts[20] = new Tile(20, 'decent grass 8', 'grass8.png', true);
	ts[21] = new Tile(21, 'decent grass 9', 'grass9.png', true);
	ts[22] = new Tile(22, 'decent grass 10', 'grass10.png', true);
	ts[23] = new Tile(23, 'decent grass 11', 'grass11.png', true);
	ts[24] = new Tile(24, 'decent grass 12', 'grass12.png', true);
	ts[25] = new Tile(25, 'decent grass 13', 'grass13.png', true);
	ts[26] = new Tile(26, 'decent grass 14', 'grass14.png', true);
	ts[35] = new Tile(35, 'Bench 1 L', 'bench1_left.png', false);
	ts[36] = new Tile(36, 'Bench 1 R', 'bench1_right.png', false);
	ts[37] = new Tile(37, 'Fence 1 full', 'fence1_full.png', false, { multi: true });
	ts[40] = new Tile(40, 'Fence 2 full', 'fence2_full.png', false, { multi: true });
	ts[43] = new Tile(43, 'Teleport', 'teleport.png', true, { tx: 15, ty: 9 });
	ts[44] = new Tile(44, 'Tree 1 L', 'tree1_left.png', false, { multi: true });
	ts[45] = new Tile(45, 'Tree 1 R', 'tree1_right.png', false, { multi: true });
	
	if (this.game) {
		this.game.debug('Tileset loaded.');
	}
	
	return ts;
};

Tileset.prototype.preloadImages = function() {
	var images = [],
		image,
		length = this.tileset.length;

	for(var i = 0; i < length; i++) {
		var tile = this.tileset[i];
	
		if ((typeof tile !== 'undefined') && (tile.src != '')) {
			image = new Image();
			image.src = this.tilesFolder + tile.src;
		}
		images[i] = image;
	}
	
	this.game.debug('Images preloaded.');
		
	return images;
};

if (typeof exports !== 'undefined') exports.loadTileset = Tileset.prototype.loadTileset;
