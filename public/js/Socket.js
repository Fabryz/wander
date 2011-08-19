var Socket = function(game) {
	//this.socket = new io.connect(null, {port: window.location.port, rememberTransport: false});
	this.socket = new io.connect('http://localhost');
	game.debug('Connecting...');
	
	return this.socket;
};
