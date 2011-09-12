(function(exports) {

var Player = function(id, x, y) {
	this.id = id || -1;
	this.nick = 'Guest'+ this.id;
	this.x = x || 0;
	this.y = y || 0;
	this.vX = 0;
	this.vY = 0;
	
	this.alive = true;
	this.status = 'normal';
	this.isChatting = false;
	this.lastMove = Date.now();
	this.hp = 100;
	this.inventory = [];
	this.ping = 0;
	
	/*this.avatar = new Image();
	this.avatar.src = './img/player.png';*/
	this.avatar = './img/player.png';
	
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
};

Player.prototype.toString = function() { //FIXME fix 48
	//return this.nick +' id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+') '+ this.vX +' '+ this.vY;
	return this.id +' '+ this.nick +' '+ this.x +':'+ this.y +' ('+ Math.floor(this.x / 48) +':'+ Math.floor(this.y / 48) +') '+ this.ping +'ms';
};

Player.prototype.drawNick = function(game) {
	var coords = game.world.mapToVp(this.x, this.y);
	
	game.ctx.save();
	
	game.ctx.fillStyle = 'rgb(0, 0, 0)';
	game.ctx.fillText(this.nick, coords.x + this.halfWidth - (this.nick.length * 8 / 2), coords.y - 10 - 1);
	game.ctx.fillText(this.nick, coords.x + this.halfWidth - (this.nick.length * 8 / 2) - 1 , coords.y - 10 + 1);
	game.ctx.fillText(this.nick, coords.x + this.halfWidth - (this.nick.length * 8 / 2) + 1 , coords.y - 10 + 1);
	game.ctx.fillStyle = 'rgb(254, 254, 254)';
	game.ctx.fillText(this.nick, coords.x + this.halfWidth - (this.nick.length * 8 / 2) , coords.y - 10);

	game.ctx.restore();
}

Player.prototype.draw = function(game) {
	var coords = game.world.mapToVp(this.x, this.y);
	
	if (game.vp.isInside(coords.x, coords.y)) { //TODO: add outer render range, TILE_SIZE * X on if
		var avatar = new Image();	//FIXME really create a new image every loop?
		avatar.src = this.avatar;
		
		game.ctx.drawImage(avatar, coords.x, coords.y, this.width, this.height);
		//this.drawNick(game);
	} else {
		//game.debug(this.id +' is moving out of viewport'); //don't render moving stuff out of viewport
	}
};

Player.prototype.hasMoved = function() {
	this.moved = (this.moveLeft || this.moveRight || this.moveUp || this.moveDown);
		
	return this.moved;
};

exports.Player = Player;
})(typeof global === "undefined" ? window : exports);
