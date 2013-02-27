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
	};

	this.draw = function() {
		var el = document.getElementById(self.id);
		if(typeof el !== 'undefined') {
			el.style.top = self.y - self.height/2;
			el.style.left = self.x - self.width/2;
		}
	};
}

function MovingObject() {
	MovingObject.superclass.constructor.call(this) 
	this.speed = [1, 1];
	this.moves = false;	
	this.direction = 'n'; //n,s,w,e	
	
	var self = this;

	if (typeof arguments[0] !== 'undefined') 
		self.id = arguments[0];	
	
	this.start = function() {
		self.moves = true;
	};	

	this.stop = function() {
		self.moves = false;
	};
	
	this.move = function() {
		if (!self.moves)
			return;
		var posChangeX = self.speed[0] * (self.direction == 'e' ? 1 : self.direction == 'w' ? -1 : 0);
		var posChangeY = self.speed[1] * (self.direction == 's' ? 1 : self.direction == 'n' ? -1 : 0);
		self.x = self.x + posChangeX;
		self.y = self.y + posChangeY;		
	};		

	this.setDirection = function(direction) {
		if(direction === 'S') {
			self.direction = 's'; self.start();//console.log(self.id + ' s move');
		} else if (direction === 'N') {
			self.direction = 'n'; self.start();//console.log(self.id + ' n move');
		} else if (direction === 'E') {
			self.direction = 'e'; self.start();//console.log(self.id + ' stop');
		} else if (direction === 'W') {
			self.direction = 'w'; self.start();//console.log(self.id + ' stop');
		}		
	};	

	this.update = function() {
		self.move();		
	};	
}

function Tank(){
	Tank.superclass.constructor.call(this, arguments[0])

	this.commandsMap = {};
	var self = this;

	this.receiveCommands = function(pressedKeysArray) {
		self.resetCommands();
		for (var i = 0; i < pressedKeysArray.length; i++) {
			self.runMappedCommands(pressedKeysArray[i]);						
		};
	};

	this.resetCommands = function() {
		self.stop();
	};

	this.setCommandsMap = function(map) {
		self.commandsMap = map;
	};

	this.runMappedCommands = function(commandKey) {						
		if (typeof self[self.commandsMap[commandKey]] !== 'undefined')
			self[self.commandsMap[commandKey]](commandKey.toUpperCase());
	};

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
extend(Tank, MovingObject);
//http://jsfiddle.net/R2YTj/