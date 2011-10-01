(function(exports) {

var Tile = function(id, name, src, walkable, extra) {
	this.id = id;
	this.name = name;
	this.src = src;
	this.walkable = walkable;
	this.extra = extra || undefined;
};

exports.Tile = Tile;
})(typeof global === "undefined" ? window : exports);
