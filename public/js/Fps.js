var Fps = function(game) {
	this.game = game; 
	this.fps = 0;
	this.count = 0;
	this.timer = 0;
	this.lastFps = 0;
};

Fps.prototype.init = function(handle) {
	this.fps = document.getElementById(handle);
	this.game.debug('Fps inited.');
	//this.timer = setInterval(this.update, 2000);
};
	
Fps.prototype.update = function() {
	/*if (this.fps) {
		this.fps.innerHTML = (this.count / 2) + 'fps';
	}*/
	this.lastFps = this.count / 2;
	this.count = 0;
};

Fps.prototype.initTimer = function() {

};
