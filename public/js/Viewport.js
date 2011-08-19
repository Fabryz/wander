var Viewport = function(game, width, height) {
	this.game = game; //main game handle
	this.width = width;
	this.height = height;
	this.x = 0;
	this.y = 0;
};

Viewport.prototype.centerOn = function(obj) {
	//this.game.debug('Centering on: '+ obj.x +':'+ obj.y);
	this.x = obj.x - (this.width / 2);
	this.y = obj.y - (this.height / 2);
};

Viewport.prototype.isInside = function(ex, epsi) { //FIXME map2coso su canvaswidth e bla
	if (((ex >= 0) && (ex < this.width)) && ((epsi >= 0) && (epsi < this.height))) {
		return true;
	}
	
	return false;
};

Viewport.prototype.resize = function(width, height) {
	this.width = width;
	this.height = height;
}


