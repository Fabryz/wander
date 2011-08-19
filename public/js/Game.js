var Game = function() {
	//this.world = new Map(this);
	this.serverConfig = this.loadServerConfig();
	this.debugMode = true;
};

Game.prototype.debug = function(msg) {
	var maxAllowed = 25;

	this.debugLog.prepend('<li>'+ msg +'</li>');

	if (this.debugLog.find('li').size() > maxAllowed) {
		this.debugLog.find('li:gt(' + ( maxAllowed-1 ) + ')' ).remove();
	}
};

Game.prototype.initVars = function() {
	this.canvas = $("#gameCanvas");
	this.ctx = this.canvas.get(0).getContext("2d");	
	this.ctx.fillStyle = 'rgb(0, 0, 0)';
	this.ctx.font = "15px Monospace";
	
	this.canvasWidth = this.canvas.width();
	this.canvasHeight = this.canvas.height();
	
	this.desiredFPS = 30; //FIXME
		
	this.canvas.after('<canvas id="debugCanvas" width="500" height="70"></canvas>');
	this.debugCanvas = $("#debugCanvas");
	this.debugCanvas.after('<div id="debugLog"><ul></ul></div>');
	this.debugLog = $("#debugLog ul");
	
	this.debugCtx = this.debugCanvas.get(0).getContext("2d");	
	this.debugCtx.fillStyle = 'rgb(0, 0, 0)';
	this.debugCtx.font = "15px Monospace";
	
	if (!this.debugMode) {
		this.debugCanvas.hide();
		$("#debugLog").hide();
	}
	
	
	this.debug('Vars inited.');
};

Game.prototype.initTick = function() {
	this.tick_count = 0;
	this.timer = 9000;
	this.debug('Tick Inited.');
};

Game.prototype.loadServerConfig = function() {
	return {	//default config
		maxPlayers: 8,
		speed: 16,
		spawnX: 0,
		spawnY: 0,
		tileMapWidth: 15,
		tileMapHeight: 15,
		tileWidth: 32,
		tileHeight: 32,
		pixelMapWidth: this.tileMapWidth * this.tileWidth,
		pixelMapHeight: this.tileMapHeight * this.tileHeight
	};
};
