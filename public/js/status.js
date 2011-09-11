$(document).ready(function() {	
	var socket = new Socket(),
		interval;
	
	var statusSlots = $('#status-slots'),
		statusPlayers = $('#status-players'),
		statusMemUsed = $('#status-memUsed'),
		statusUptime = $('#status-uptime');
		    
    socket.on('connect', function() {
    	interval = setInterval(function() {
			socket.emit('status');
		}, 5000);
	});
			
	socket.on('disconnect', function() {
		clearInterval(interval);
	});
	
	socket.on('status', function(data) {
		statusSlots.html(data.players.length);

		if (data.players.length > 0) {
			statusPlayers.html('');
			data.players.forEach(function (p) {
				if (p.id) {
					statusPlayers.append('<li>'+ p.nick +' '+ p.ping +'ms</li>');
				}
			});
		}
		
		statusUptime.html(data.uptime);
		statusMemUsed.html(data.memUsed);
	});
});
