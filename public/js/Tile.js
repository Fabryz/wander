(function(exports) {

var Tile = function(id, name, src, walkable, extra) {
	this.id = id;
	this.name = name;
	this.src = src;
	this.walkable = walkable;
	this.extra = extra || undefined;
};

Tile.prototype.preLoad = function () {  //preload images client side
	this.image = new Image();
	this.image.src = this.src;
};

exports.Tile = Tile;
})(typeof global === "undefined" ? window : exports);
