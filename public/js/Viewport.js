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

Viewport.prototype.isInside = function(x, y) { //FIXME map2stuff on canvaswidth 
	if (((x >= 0) && (x < this.width)) && ((y >= 0) && (y < this.height))) {
		return true;
	}
	
	return false;
};

Viewport.prototype.resize = function(width, height) {
	this.width = width;
	this.height = height;
};
