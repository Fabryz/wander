$(document).ready(function() {	
	var socket = new Socket(null, 'status'),
		interval;
	
	var statusSlots = $('#status-slots'),
		statusLurkers = $('#status-lurkers'),
		statusPlayers = $('#status-list'),
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
		statusLurkers.html(data.lurkers);

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
