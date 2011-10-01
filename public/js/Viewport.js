var Viewport = function(game, width, height) {
	this.game = game; //main game handle
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;
	this.rangeX = 1;
	this.rangeY = 1;
};

Viewport.prototype.centerOn = function(x, y) {
	//this.game.debug('Centering on: '+ x +':'+ y);
	this.x = x - (this.width / 2);
	this.y = y - (this.height / 2);
};

//If is inside viewport + tilesize * range (safety render border)
Viewport.prototype.isInside = function(x, y) {
	var rangeTileWidth = this.game.serverConfig.tileWidth * this.rangeX,
		rangeTileHeight = this.game.serverConfig.tileHeight * this.rangeY;

	//FIXME if (((x >= 0) && (x < this.width)) && ((y >= 0) && (y < this.height))) {
	if (((x >= -rangeTileWidth) && (x < this.width + rangeTileWidth)) &&
		((y >= -rangeTileHeight) && (y < this.height + rangeTileHeight))) {
		return true;
	}
	
	return false;
};

Viewport.prototype.resize = function(width, height) {
	this.width = width;
	this.height = height;
};
