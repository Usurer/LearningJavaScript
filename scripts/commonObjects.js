function CommonObject() {
	var self = this;
	this.id = undefined;
	this.age = 0;
	this.maxAge = 0;
	this.dead = false;	
	this.health = 100;
	this.isPlayer = false;
	this.isAI = false;
	this.isEnvironment = false;

	this.hit = function(hitBy, damage) {			
		if(hitBy !== undefined && hitBy instanceof Missile) {			
			hitBy.dead = true;
			if (!(hitBy.isAI && self.isAI) && !(hitBy.isPlayer && self.isPlayer)) {
				if (damage === undefined) damage = 25;
				self.health = self.health - damage;				
				if (self.health < 0) self.dead = true;
			};
		};
	};
};

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

	this.draw = function(canvas, specialProperties) {
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
			objDiv.style.zIndex = '1';
			if(typeof self.sprite !== 'undefined' && self.sprite.length > 0) {
				objDiv.style.backgroundImage = "url(img/" + self.sprite + ')';
			}
			else {
				objDiv.style.background = currentObject.background;
			};
			
			/*specialProperties should be an array of pairs: [[propertyName, propertyValue],[name, value], [...]...]*/
			if(specialProperties !== undefined) {				
				for(var sp = 0; sp < specialProperties.length; sp++) {
					objDiv.style[specialProperties[sp][0]] = specialProperties[sp][1];
				};
			};
			
			canvas.appendChild(objDiv);				
		};
		el = document.getElementById(self.id);
		if(el != null && typeof el !== 'undefined') {
			el.style.top = self.y - self.height/2;
			el.style.left = self.x - self.width/2;

			//temprorary
			if(typeof self.sprite !== 'undefined' && self.sprite.length > 1) {
				el.style.backgroundImage = "url(img/" + self.sprite + ')';
			}
			else {
				el.style.background = self.background;
			}
			//temprorary
			//el.style.background = self.background;
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
	
	this.move = function(collisionChecker, args) {
		if (!self.moves)
			return true;
		var posChangeX = self.speed[0] * (self.direction == 'e' ? 1 : self.direction == 'w' ? -1 : 0);
		var posChangeY = self.speed[1] * (self.direction == 's' ? 1 : self.direction == 'n' ? -1 : 0);
		self.x = self.x + posChangeX;
		self.y = self.y + posChangeY;
		
		if (self.sprite.length > 0) {
			var postfixStart = self.sprite.length - 5; //'*.png'
			self.sprite = self.sprite.substr(0, postfixStart) + self.direction + '.png';
		};

		var collisionCheckResult = undefined;
		if (typeof args !== 'undefined' && args.length > 2 && (collisionCheckResult = collisionChecker(args[0], args[1], args[2], args[3])) !== undefined) {
			self.x = self.x - posChangeX;
			self.y = self.y - posChangeY;			
			collisionCheckResult.hit(self);
			return false;
		};
		return true;
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

	this.update = function(collisionChecker, args) {		
		if(self.age > self.maxAge) {
			self.dead = true;
		}
		
		if(self.maxAge > 0)
			self.age++;

		return self.move(collisionChecker, args); // false if obj cannot move, true if can;
	};	

	this.moveTo = function(objective) {
		var xDirection = objective[0] - self.getPosition()[0];
		var yDirection = objective[1] - self.getPosition()[1];
		var direction = '';
		if (Math.abs(xDirection) > Math.abs(yDirection)) {
			direction = xDirection > 0 ? 'E' : 'W';
		}
		else {
			direction = yDirection > 0 ? 'S' : 'N';	
		};
		self.setDirection(direction);
	};
};

function Tank(){
	Tank.superclass.constructor.call(this, arguments[0]);
	this.commandsMap = {};
	this.missiles = [];
	this.speed = [3,3];
	this.isPlayer = true;
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
		var removed;	
		if(self.missiles.length > 0) {
			/*Let's check that missiles aren't dead already*/
			for (var i = 0; i < self.missiles.length; i++) {
				if (self.missiles[i].dead == true) {
					removed = self.missiles.splice(i, 1);
				};
			};
			/*So if them aren't, then don't fire*/
			if(self.missiles.length > 0) return undefined;
		};

		var missile = new Missile();
		/*sets missile position in accordance with tank direction*/
		var pos = self.direction == 'n' ? [self.getPosition()[0], self.getPosition()[1] - self.getSize()[1] / 2 - 5 - 1] :
			(self.direction == 's' ? [self.getPosition()[0], self.getPosition()[1] + self.getSize()[1] / 2 + 5 + 1] :
				(self.direction == 'e' ? [self.getPosition()[0] + self.getSize()[0] / 2 + 5 + 1, self.getPosition()[1]] :
					[self.getPosition()[0] - self.getSize()[0] / 2 - 5 - 1, self.getPosition()[1]]
				)
			);
		missile.initialize(pos, [10, 10], 'missile_10x10_n.png', 'White');
		missile.direction = self.direction;
		missile.isPlayer = self.isPlayer;
		missile.isAI = self.isAI;
		self.missiles.push(missile);
		return missile;
	};	
};

function Missile() {
	Missile.superclass.constructor.call(this);
	var self = this;	
	self.maxAge = 50;	
	self.moves = true;
	self.speed = [10, 10];
	self.isEnvironment = true;
};

function Wall() {
	Wall.superclass.constructor.call(this);
	var self = this;	
};

function TankAI() {
	TankAI.superclass.constructor.call(this, arguments[0]);

	this.movementCommandsCounter = 0;
	this.speed = [2, 2];	
	this.isPlayer = false;
	this.isAI = true;
	var self = this;	

	this.getRandomCommandResult = function() {
		var r = Math.floor(Math.random() * 11) + 1;
		switch(r) {
			case 1: return self['setDirection']('N');
			case 2: return self['setDirection']('S');
			case 3: return self['setDirection']('S');
			case 4: return self['setDirection']('W');
			case 5: return self['setDirection']('W');
			case 6: return self['setDirection']('E');
			case 7: return self['setDirection']('E');
			default: return self['fireAi']();
		};
	};		

	this.receiveCommands = function(targets) {		
		var commandsResult = [];		
		if(self.movementCommandsCounter > 50){
			var randomCommandOrGoToTarget = Math.random() > 0.6;
			if (randomCommandOrGoToTarget) {
				//self.background = 'White';
				self.resetCommands();			
				var r = self.getRandomCommandResult();
				commandsResult.push(r);			
				self.movementCommandsCounter = 0;
			} 
			else if (typeof targets[0] !== 'undefined') {
				//self.background = 'Red';				
				self.resetCommands();											
				self.moveTo(targets[0].getPosition());
				if(Math.random() > 0.6) commandsResult.push(self.fire());	
				self.movementCommandsCounter = 0;				
			};
		}
		
		self.movementCommandsCounter++;	
		return commandsResult;		
	};

	this.fireAi = function() {
		self.movementCommandsCounter = 0;
		return self.fire();
	};

	this.changeDirection = function() {
		//self.background = 'Magenta';
		self.movementCommandsCounter = 51;
	};
};

function MapBorder() {
	this.hit = function(hitBy) {
		console.log('Border hit by ' + hitBy.id);
		if(hitBy instanceof Missile)
			hitBy.dead = true;
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
extend(TankAI, Tank);
extend(Missile, MovingObject);
extend(Wall, Sprite);
//http://jsfiddle.net/R2YTj/

