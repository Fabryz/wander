var Socket = function(game) {	
	this.socket = new io.connect('http://' + window.location.hostname);
	
	if (game) {
		game.debug('Connecting...');
	}
	
	return this.socket;
};
