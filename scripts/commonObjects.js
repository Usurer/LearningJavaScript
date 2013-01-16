function Sprite() {
	this.x = 0;
	this.y = 0;
	this.visible = false;
	this.height = 0;
	this.width = 0;
	this.sprite = '';
	this.background = "Transparent";
	
	this.getPosition = function() {
		return [this.x, this.y];
	};
	
	this.getSize = function() {
		return [this.width, this.height];
	};
	
	var setSize = function(size) {
		this.width = size[0];
		this.height = size[1];
	};
	
	var setPosition = function(position) {
		this.x = position[0];
		this.y = position[1];
	};
	
	this.initialize = function(position, size, spriteUrl, backgroundColor) {
		if (arguments.length < 3)
			return;
		
		setPosition(position);
		setSize(size);
		this.sprite = spriteUrl;
		this.background = typeof backgroundColor === 'undefined' ? 'Transparent' : backgroundColor;
	}
}

function MovingObject() {
	this.speed = [0, 0];
	this.moves = false;	
	this.direction = 'n'; //n,s,w,e
	
	this.start = function() {
		this.moves = true;
	};	
	
	this.move = function() {
		if (!this.moves)
			return;
		var posChangeX = this.speed[0] * (this.direction == 'e' ? 1 : this.direction == 'w' ? -1 : 0);
		var posChangeY = this.speed[1] * (this.direction == 's' ? 1 : this.direction == 'n' ? -1 : 0);
		this.x = this.x + posChangeX;
		this.y = this.y + posChangeY;		
	};
	
	this.stop = function() {
		this.moves = false;
	}
}

MovingObject.prototype = Sprite;
MovingObject.prototype.constructor = MovingObject;