var Vector2 = function(x , y) {
	this.x = x || 0
	this.y = y || 0
	this.set = function(x,y) {
		this.x = x;
		this.y = y;
	};
	this.normalize = function() {
		length = sqrt(this.x * this.x + this.y * this.y);
		this.x /= length;
		this.y /= length;
	}
	this.add = function(v2) {
		this.x += v2.x;
		this.y += v2.y;
		return this;
	}
	this.subtract = function(v2) {
		this.x -= v2.x;
		this.y -= v2.y;
		return this;
	}
};