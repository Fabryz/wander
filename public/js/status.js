$(document).ready(function() {	
	var proto = new Protocol(),
		socket = new Socket(null, 'status'),
		updateEvery = 5000,
		timeout;
	
	var statusSlots = $('#status-slots'),
		statusLurkers = $('#status-lurkers'),
		statusPlayers = $('#status-list'),
		statusMemUsed = $('#status-memUsed'),
		statusUptime = $('#status-uptime');
	
	function updateStatus() {
		socket.emit(proto.MSG_SERVERSTATUS);
		timeout = setTimeout(updateStatus, updateEvery);
	}	
	
    socket.on('connect', function() {
    	updateStatus();
	});
			
	socket.on('disconnect', function() {
		clearTimeout(timeout);
	});
	
	socket.on(proto.MSG_SERVERSTATUS, function(data) {
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
