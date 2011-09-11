var Socket = function(game) {	
	this.socket = new io.connect('http://localhost');
	//this.socket = new io.connect('http://wander.nodejitsu.com/');
	
	if (game) {
		game.debug('Connecting...');
	}
	
	return this.socket;
};
