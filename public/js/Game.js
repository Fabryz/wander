var Game = function() {
	this.serverConfig = this.loadServerConfig();
	this.check = this.initCheck();
	this.player = {};
	this.players = [];
};

Game.prototype.debug = function(msg) {
	var maxLinesAllowed = 25;

	this.debugLog.prepend('<li>'+ msg +'</li>');

	if (this.debugLog.find('li').size() > maxLinesAllowed) {
		this.debugLog.find('li:gt(' + ( maxLinesAllowed-1 ) + ')' ).remove();
	}
};

Game.prototype.chatMessage = function(msg) {
	$('#chatLog ul').append('<li>'+ msg +'</li>');
	$('#chatLog').prop('scrollTop', $('#chatLog').prop('scrollHeight'));
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
	
	this.debugCanvasWidth = this.debugCanvas.width();
	this.debugCanvasHeight = this.debugCanvas.height();
	
	this.debugCtx = this.debugCanvas.get(0).getContext("2d");	
	this.debugCtx.fillStyle = 'rgb(0, 0, 0)';
	this.debugCtx.font = "15px Monospace";
	
	//FIXME testing audio
	this.audio = [];
	this.audio.push('<audio id="bgm-ambient1" preload loop><source src="./audio/ambient1.ogg" /></audio>');
	this.audio.push('<audio id="sfx-newPlayer" preload><source src="./audio/newPlayer.ogg" /></audio>');
	
	var audioLength = this.audio.length;
	for(var i = 0; i < audioLength; i++) {
		this.canvas.after(this.audio[i]);
	}

	this.debugCanvas.hide();
	$("#debugLog").hide();
	
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

Game.prototype.debugStuff = function() {
	this.debugCtx.clearRect(0, 0, this.debugCanvasWidth, this.debugCanvasHeight);
	
	this.debugCtx.fillText(this.player, 10, 15);
	this.debugCtx.fillText('vp '+ this.vp.x +':'+ this.vp.y, 10, 37);
	this.debugCtx.fillText(this.tick_count, 130, 37);
	
	this.debugCtx.fillText(this.player.ping +'ms', 10, this.debugCanvasHeight - 10);
	this.debugCtx.fillText(this.fps.lastFps +'fps', 100, this.debugCanvasHeight - 10);
};

Game.prototype.initCheck = function() {
	//boolean var for every phase of the connection
	return {
		isConnected: false,
		hasConfig: false,
		hasId: false,
		hasNick: false,
		hasPlayerList: false,
		isPlaying: false,
		hasQuitted: false,
	};
};

Game.prototype.isReady = function() {
	this.debug('Check: '+ this.check.isConnected +' '+ this.check.hasConfig +' '+ this.check.hasId +' '+ this.check.hasNick +' '+ this.check.hasPlayerList);
	return this.check.isConnected && this.check.hasConfig && this.check.hasId && this.check.hasNick && this.check.hasPlayerList;
};
