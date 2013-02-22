function CommonObject() {
	this.id = -100;
}

function Sprite() {
	this.x = 0;
	this.y = 0;
	this.visible = false;
	this.height = 0;
	this.width = 0;
	this.sprite = '';
	this.background = "Transparent";
	
	var self = this;
	
	this.getPosition = function() {
		return [self.x, self.y];
	};
	
	this.getSize = function() {
		return [self.width, self.height];
	};
	
	var setSize = function(size) {
		self.width = size[0];
		self.height = size[1];
	};
	
	var setPosition = function(position) {
		self.x = position[0];
		self.y = position[1];
	};
	
	this.initialize = function(position, size, spriteUrl, backgroundColor) {
		if (arguments.length < 3)
			return;
		
		setPosition(position);
		setSize(size);
		self.sprite = spriteUrl;
		self.background = typeof backgroundColor === 'undefined' ? 'Transparent' : backgroundColor;
	}
}

function MovingObject() {
	MovingObject.superclass.constructor.call(this) 
	this.speed = [0, 0];
	this.moves = false;	
	this.direction = 'n'; //n,s,w,e
	var self = this;

	if (typeof arguments[0] !== 'undefined') 
		self.id = arguments[0];	
	
	this.start = function() {
		self.moves = true;
	};	
	
	this.move = function() {
		if (!self.moves)
			return;
		var posChangeX = self.speed[0] * (self.direction == 'e' ? 1 : self.direction == 'w' ? -1 : 0);
		var posChangeY = self.speed[1] * (self.direction == 's' ? 1 : self.direction == 'n' ? -1 : 0);
		self.x = self.x + posChangeX;
		self.y = self.y + posChangeY;		
	};
	
	this.stop = function() {
		self.moves = false;
	}
}

function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

extend(Sprite, CommonObject);
extend(MovingObject, Sprite);

/*Sprite.prototype = new CommonObject();
Sprite.prototype.constructor = Sprite;

MovingObject.prototype = new Sprite();
MovingObject.prototype.constructor = MovingObject;*/
//http://jsfiddle.net/R2YTj/