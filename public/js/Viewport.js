var Viewport = function(game, width, height) {
	this.game = game; //main game handle
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;
};

Viewport.prototype.centerOn = function(x, y) {
	//this.game.debug('Centering on: '+ x +':'+ y);
	this.x = x - (this.width / 2);
	this.y = y - (this.height / 2);
};

//If is inside viewport + tilesize * range (safety border)
Viewport.prototype.isInside = function(x, y) {
	var rangeTileWidth = this.game.serverConfig.tileWidth * 1,
		rangeTileHeight = this.game.serverConfig.tileHeight * 1;

	//FIXME if (((x >= 0) && (x < this.width)) && ((y >= 0) && (y < this.height))) {
	if (((x >= -rangeTileWidth) && (x < this.width + rangeTileWidth)) && ((y >= -rangeTileHeight) && (y < this.height + rangeTileHeight))) {
		return true;
	}
	
	return false;
};

Viewport.prototype.resize = function(width, height) {
	this.width = width;
	this.height = height;
};
