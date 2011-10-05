(function(exports) {

var Protocol = function() {
	return {
		MSG_PING			: 1,
		MSG_PONG			: 2,
		MSG_PINGUPDATE		: 3,

		MSG_CHATMSG			: 4,
		MSG_CHATACTION		: 5,

		MSG_PLAYERLIST		: 6,

		MSG_NICKSET			: 7,
		MSG_NICKCHANGE		: 8,
		MSG_NICKRESPONSE	: 9,

		MSG_NEWPLAYER		: 10,
		MSG_JOIN			: 11,
		MSG_PLAY			: 12,
		MSG_QUIT			: 13,

		MSG_SERVERCONFIG	: 14,
		MSG_SERVERINFO		: 15,
		MSG_SERVERSTATUS	: 16
	};
};

exports.Protocol = Protocol;
})(typeof global === "undefined" ? window : exports);
