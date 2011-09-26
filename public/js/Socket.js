var Socket = function(game, namespace) {
	this.namespace = namespace || 'game';
	this.url = window.location.hostname +'/'+ this.namespace;
	this.socket = new io.connect('http://'+ this.url);
	
	if (game) {
		game.debug('Connecting...');
	}
	
	return this.socket;
};
