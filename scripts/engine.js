function MainLoop() {
	this.fps = 50; //draw loops per second
	this.ups = 20; //update loops per second
	
	this.gameObjects = [];	
	this.globals = [];
	this.pressedKeys = [];
	this.tanks = [];
	
	var self = this;
	
	var keyCodeMapper = function(keyCode) {
		switch (keyCode) {
			case 37: return 'w';
			case 38: return 'n';
			case 39: return 'e';
			case 40: return 's';
			case 87: return 'N'; //W
			case 83: return 'S'; //A
			case 65: return 'W'; //S
			case 68: return 'E'; //D
			case 32: return 'SPACE'; //space
			case 17: return 'RCTRL'; //rctrl
			default: return null;
		};
	};
	
	/*	
		Take a look at http://jsfiddle.net/HwR9N/3/
		The main idea there to use keys[e.keyCode] array to store pressed keys.
		If key is released, keys[e.keyCode] is set to non-numeral value like False.
		Dadz cool.
	*/
	var keyDownHandler = function(e) {
		console.log(e.keyCode);
		var pressedKey = keyCodeMapper(e.keyCode);
		
		if (pressedKey != null) {
			for (i = 0; i < self.pressedKeys.length; i++) {
				if (self.pressedKeys[i] === pressedKey) {
					return;
				}				
			}
			self.pressedKeys.push(pressedKey);
		};
		
		new DebuggingMessage().pressedBtn(self.pressedKeys);
	};
	
	var keyUpHandler = function(e) {
		var releasedKey = keyCodeMapper(e.keyCode);		
		if (releasedKey != null) {
			for (i = 0; i < self.pressedKeys.length; i++) {
				if (self.pressedKeys[i] == releasedKey) {
					self.pressedKeys.splice(i, 1); //remove element from array					
				}
			}
		};
		new DebuggingMessage().pressedBtn(self.pressedKeys);
	};

	this.createFirstTank = function() {
		var newTank = new Tank(0);
		var map = {'S': 'setDirection', 'N': 'setDirection', 'E': 'setDirection', 'W': 'setDirection', 'SPACE': 'fire'};
		newTank.setCommandsMap(map);
		newTank.initialize([50, 50], [50, 50], '', 'Red');
		self.gameObjects[newTank.id] = newTank;
		self.tanks[0] = newTank;
	};

	this.createSecondTank = function() {
		var newTank = new Tank(1);
		var map = {'s': 'setDirection', 'n': 'setDirection', 'e': 'setDirection', 'w': 'setDirection', 'RCTRL': 'fire'};
		newTank.setCommandsMap(map);
		newTank.initialize([200, 200], [50, 50], '', 'Blue');
		self.gameObjects[newTank.id] = newTank;
		self.tanks[1] = newTank;
	};

	this.initTanks = function() {
		var canvas = document.getElementById('canvas');
		var currentObject = undefined;
		for (var i = 0; i < self.gameObjects.length; i++) {
			if (typeof self.gameObjects[i] === 'undefined')
				continue;
			currentObject = self.gameObjects[i];
			var objDiv = document.createElement('div');
			objDiv.setAttribute('id', self.gameObjects[i].id);
			objDiv.style.width = currentObject.width + 'px';
			objDiv.style.height = currentObject.height + 'px';
			objDiv.style.position = 'relative';
			objDiv.style.top = currentObject.y - currentObject.height/2;
			objDiv.style.left = currentObject.x - currentObject.width/2;
			objDiv.style.background = currentObject.background;
			canvas.appendChild(objDiv);		
		};
	};

	this.draw = function() {		
		console.log('tick');

		
		/*Here are the bad news - we cannot fire missile from the Tank class in current object model realization, because only game engine has access to gameObjects, globals etc. I see three ways to solve the problem:
		1. This is what I've started to do below - if 'fire' is pressed, then game engine will emulate the fire.
		2. Move object arrays to the outer scope - make 'em really global and access 'em from Tank.
		3. When Tank processes commands it will create the array of results. If the result of command is a new object it will be added to this array. Then array is returned to engine and objects from it are moved to gameObjects array. That what I'll try to do now.

		for (var i = 0; i < self.pressedKeys[length; i++) {
			if(self.pressedKeys[i] === 'SPACE') this.firstTankFire();
			else if(self.pressedKeys[i] === 'RCTRL') this.secondTankFire();
		};*/

		var newObjects = [];
		for (var j = 0; j < self.gameObjects.length; j++) {
			if(typeof self.gameObjects[j].receiveCommands !== 'undefined') {
				/*A trick to join two arrays without a new array creation (as concat does). It's also faster than concat. 
				See also: http://jsperf.com/concat-vs-push-apply/11 */			
				newObjects.push.apply(newObjects, self.gameObjects[j].receiveCommands(self.pressedKeys));
			}

			if(typeof self.gameObjects[j].update !== 'undefined')
				self.gameObjects[j].update();

			if(typeof self.gameObjects[j].draw === 'undefined')
				continue;			
			self.gameObjects[j].draw();
		};
		
		if (newObjects.length > 0) {
			for (var i = 0; i < newObjects.length; i++) {
				if (typeof newObjects[i] === 'undefined')
					continue;
				currentObject = newObjects[i];
				if (typeof currentObject.id === 'undefined') 
					currentObject.id = self.gameObjects.length + i;
				var objDiv = document.createElement('div');
				objDiv.setAttribute('id', self.gameObjects[i].id);
				objDiv.style.width = currentObject.width + 'px';
				objDiv.style.height = currentObject.height + 'px';
				objDiv.style.position = 'relative';
				objDiv.style.top = currentObject.y - currentObject.height/2;
				objDiv.style.left = currentObject.x - currentObject.width/2;
				objDiv.style.background = currentObject.background;
				canvas.appendChild(objDiv);

				self.gameObjects.push(currentObject);
			};

			//self.gameObjects.push.apply(self.gameObjects, newObjects); - it will also add 'undefined' values to gameObjects, so don't use it;
		};
	};
	
	this.run = function() {		
		self.createFirstTank();
		self.createSecondTank();
		self.initTanks();
		
		document.onkeydown = keyDownHandler;
		document.onkeyup = keyUpHandler;

		new DebuggingMessage().textMsg(self.gameObjects.length);

		var drawer = setInterval(self.draw, 1000 / this.fps);
		/*var updater = setInterval(function(){}, 1000 / this.ups);
		var drawer = setInterval(function(){}, 1000 / this.fps);*/
	};
}

function DebuggingMessage() {
	this.pressedBtn = function(btnsArray) {
		var msg = "Pressed buttons are: ";
		for (btn in btnsArray) {
			msg = msg + btnsArray[btn];
		}
		document.getElementById('pressedButtons').innerHTML = msg;
	};

	this.textMsg = function(textMsg) {
		document.getElementById('message').innerHTML = textMsg;	
	}
}

new MainLoop().run();