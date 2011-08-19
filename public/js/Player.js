var Player = function() {
	this.id = -1;
	this.nick = "";
	this.x = 0;
	this.y = 0;
	this.vX = 0;
	this.vY = 0;
	
	this.alive = true;
	this.status = "normal";
	this.lastMove = Date.now();
	this.hp = 100;
	this.inventory = [];
	
	this.avatar = new Image();
	this.avatar.src = './img/player.png';
	//this.width = serverConfig.tileWidth; FIXME
	//this.height = serverConfig.tileHeight;
	this.width = 32;
	this.height = 32;
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
	return this.nick +' id: '+ this.id +' x: '+ this.x +' ('+ (this.x+this.width) +') y: '+ this.y +' ('+ (this.y + this.height)+') '+ this.vX +' '+ this.vY;
};
