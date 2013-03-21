function CommonObject() {
	var self = this;
	this.id = undefined;
	this.age = 0;
	this.maxAge = 0;
	this.dead = false;	
}

function Sprite() {
	Sprite.superclass.constructor.call(this);
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

	this.draw = function(canvas) {
		var el = document.getElementById(self.id);
		if(el == null || typeof el === 'undefined') {
			if (typeof canvas === 'undefined') return;
			var currentObject = self;			
			var objDiv = document.createElement('div');
			objDiv.setAttribute('id', currentObject.id);
			objDiv.style.width = currentObject.width + 'px';
			objDiv.style.height = currentObject.height + 'px';
			objDiv.style.position = 'fixed';
			objDiv.style.top = currentObject.y - currentObject.height/2;
			objDiv.style.left = currentObject.x - currentObject.width/2;
			objDiv.style.background = currentObject.background;
			canvas.appendChild(objDiv);				
		};
		el = document.getElementById(self.id);
		if(el != null && typeof el !== 'undefined') {
			el.style.top = self.y - self.height/2;
			el.style.left = self.x - self.width/2;
			//temprorary
			el.style.background = self.background;
		};
	};

	this.remove = function(canvas) {
		var el = document.getElementById(self.id);
		canvas.removeChild(el);
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
	
	this.move = function(collisionChecker, args, callback) {
		if (!self.moves)
			return;
		var posChangeX = self.speed[0] * (self.direction == 'e' ? 1 : self.direction == 'w' ? -1 : 0);
		var posChangeY = self.speed[1] * (self.direction == 's' ? 1 : self.direction == 'n' ? -1 : 0);
		self.x = self.x + posChangeX;
		self.y = self.y + posChangeY;

		var collisionCheckResult = undefined;
		if (typeof args !== 'undefined' && args.length > 2 && (collisionCheckResult = collisionChecker(args[0], args[1], args[2], args[3])) !== undefined) {
			self.x = self.x - posChangeX;
			self.y = self.y - posChangeY;
			if (self instanceof Missile) {
				self.dead = true; //Missile explodes on collision.
				collisionCheckResult.background = 'Yellow';
				callback(collisionCheckResult);
			};
		};
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

	this.update = function(collisionChecker, args, callback) {		
		if(this.age > this.maxAge) {
			this.dead = true;
		}
		self.move(collisionChecker, args, callback);		
		if(this.maxAge > 0)
			this.age++;
	};	
}

function Tank(){
	Tank.superclass.constructor.call(this, arguments[0]);
	this.commandsMap = {};
	this.missiles = [];
	var self = this;

	this.receiveCommands = function(pressedKeysArray) {
		self.resetCommands();
		var commandsResult = [];
		for (var i = 0; i < pressedKeysArray.length; i++) {
			commandsResult.push(self.runMappedCommands(pressedKeysArray[i]));
		};
		return commandsResult;
	};

	this.resetCommands = function() {
		self.stop();
	};

	this.setCommandsMap = function(map) {
		self.commandsMap = map;
	};

	this.runMappedCommands = function(commandKey) {						
		if (typeof self[self.commandsMap[commandKey]] !== 'undefined')
			return self[self.commandsMap[commandKey]](commandKey.toUpperCase());
	};

	this.fire = function() {
		/*We can't have more then one missile.*/		
		if(self.missiles.length > 0) {
			/*Let's check that missiles aren't dead already*/
			for (var i = 0; i < self.missiles.length; i++) {
				if (self.missiles[i].dead == true)
					self.missiles.splice(i, 1);
			};
			/*So if them aren't, then don't fire*/
			if(self.missiles.length > 0) return undefined;
		}

		var missile = new Missile();
		/*sets missile position in accordance with tank direction*/
		var pos = self.direction == 'n' ? [self.getPosition()[0], self.getPosition()[1] - self.getSize()[1] / 2 - 5 - 1] :
			(self.direction == 's' ? [self.getPosition()[0], self.getPosition()[1] + self.getSize()[1] / 2 + 5 + 1] :
				(self.direction == 'e' ? [self.getPosition()[0] + self.getSize()[0] / 2 + 5 + 1, self.getPosition()[1]] :
					[self.getPosition()[0] - self.getSize()[0] / 2 - 5 - 1, self.getPosition()[1]]
				)
			);
		missile.initialize(pos, [10, 10], '', 'White');
		missile.direction = self.direction;
		self.missiles.push(missile);
		return missile;
	};

}

function Missile() {
	Missile.superclass.constructor.call(this);
	var self = this;	
	self.maxAge = 20;	
	self.moves = true;
	self.speed = [5, 5];
};

function Wall() {
	Wall.superclass.constructor.call(this);
	var self = this;

	this.hit = function() {
		self.dead = true;		
	};
};

function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
};

extend(Sprite, CommonObject);
extend(MovingObject, Sprite);
extend(Tank, MovingObject);
extend(Missile, MovingObject);
extend(Wall, Sprite);
//http://jsfiddle.net/R2YTj/