var Player = function() {
	this.id = -1;
	this.nick = "Unnamed";
	this.x = 0;
	this.y = 0;
	this.vX = 0;
	this.vY = 0;
	
	this.alive = true;
	this.status = "normal";
	this.lastMove = Date.now();
	this.hp = 100;
	this.inventory = [];
	this.ping = 0;
	
	this.avatar = new Image();
	this.avatar.src = './img/player.png';
	//this.width = serverConfig.tileWidth; FIXME or hardcode?
	//this.height = serverConfig.tileHeight;
	this.width = 48;
	this.height = 48;
	this.halfWidth = this.width/2;
	this.halfHeight = this.height/2; 		
	
	this.moved = false;
	this.moveLeft = false;
	this.moveRight = false;
	this.moveUp = false;
	this.moveDown = false;
	    
	/*this.draw = function(c) {
	    c.drawImage(this.avatar, this.x, this.y, this.width, this.height);
	    c.fillText(this.nick, this.x + this.halfWidth, this.y - 10);
	};*/
};

Player.prototype.toString = function() {
	//return this.nick +' id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+') '+ this.vX +' '+ this.vY;
	return this.id +' '+ this.nick +' '+ this.x +':'+ this.y +' ('+ Math.floor(this.x / 48) +':'+ Math.floor(this.y / 48) +') '+ this.ping +'ms';
};

Player.prototype.draw = function(game) {
	var coords = game.world.mapToVp(this.x, this.y);
	
	if (game.vp.isInside(coords.x, coords.y)) { //TODO: add outer render range, TILE_SIZE * X on if
		game.ctx.drawImage(this.avatar, coords.x, coords.y, this.width, this.height);
		game.ctx.fillText(this.nick +' - '+ this.moved, coords.x + this.halfWidth, coords.y - 10);
	} else {
		//game.debug(this.id +' is moving out of viewport'); //don't render moving stuff out of viewport
	}
};

Player.prototype.hasMoved = function() {
	this.moved = (this.moveLeft || this.moveRight || this.moveUp || this.moveDown);
		
	return this.moved;
};