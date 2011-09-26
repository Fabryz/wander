var Tile; Tile = Tile || require('./Tile.js').Tile;  //for the shared code

var Tileset = function(game) {
	this.game = game;
	this.tileset = this.loadTileset();
	this.images = this.preloadImages();
};

Tileset.prototype.loadTileset = function() {
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
	ts.push(new Tile(37, 'Fence 1 full', './img/fence1_full.png', false, { multi: true }));
	ts.push(new Tile(38, 'Fence 1 T', './img/fence1_top.png', true));
	ts.push(new Tile(39, 'Fence 1 B', './img/fence1_bottom.png', false));
	ts.push(new Tile(40, 'Fence 2 full', './img/fence2_full.png', false, { multi: true }));
	ts.push(new Tile(41, 'Fence 2 T', './img/fence2_top.png', true));
	ts.push(new Tile(42, 'Fence 2 B', './img/fence2_bottom.png', false));
	ts.push(new Tile(43, 'Teleport', './img/teleport.png', true, { tx: 15, ty: 9 }));
	
	if (this.game) {
		this.game.debug('Tileset loaded.');
	}
	
	return ts;
};

Tileset.prototype.preloadImages = function() {
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

if (typeof exports !== 'undefined') exports.loadTileset = Tileset.prototype.loadTileset;
