var Fps = function(game, time) {
	this.game = game;
	this.time = time;
	this.fps = null;
	this.count = 0;
	this.timer = null;
	this.lastFps = 0;
};

Fps.prototype.init = function(handle) {
	this.fps = document.getElementById(handle);
	this.game.debug('Fps inited.');
	this.startTimer();
};
	
Fps.prototype.update = function() {
	/*if (this.fps) {
		this.fps.innerHTML = (this.count / 2) + 'fps';
	}*/
	this.lastFps = this.count / (this.time / 1000);
	this.count = 0;
};

Fps.prototype.startTimer = function() {
	var that = this;
	this.timer = setTimeout(function() {
		that.update();
		that.startTimer();
	}, this.time); 
};
