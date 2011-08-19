var Tile = function(id, name, src, block) {
	this.id = id;
	this.name = name;
	this.src = src;
	this.block = block;
	this.image = new Image();
	this.image.src = this.src;
};
