(function(exports) {

var Tile = function(id, name, src, walkable) {
	this.id = id;
	this.name = name;
	this.src = src;
	this.walkable = walkable;
};

Tile.prototype.preLoad = function () {  //preload images client side
	this.image = new Image();
	this.image.src = this.src;
};

exports.Tile = Tile;
})(typeof global === "undefined" ? window : exports);
