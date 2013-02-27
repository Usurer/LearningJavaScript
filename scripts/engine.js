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
		var newTank = new MovingObject(0);
		var map = {'S': 'setDirection', 'N': 'setDirection', 'E': 'setDirection', 'W': 'setDirection'};
		newTank.setCommandsMap(map);
		newTank.initialize([50, 50], [50, 50], '', 'Red');
		self.gameObjects[newTank.id] = newTank;
		self.tanks[0] = newTank;
	};

	this.createSecondTank = function() {
		var newTank = new MovingObject(1);
		var map = {'s': 'setDirection', 'n': 'setDirection', 'e': 'setDirection', 'w': 'setDirection'};
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
		for (var j = 0; j < self.gameObjects.length; j++) {
			if(typeof self.gameObjects[j].receiveCommands !== 'undefined')
				self.gameObjects[j].receiveCommands(self.pressedKeys);

			if(typeof self.gameObjects[j].update !== 'undefined')
				self.gameObjects[j].update();

			if(typeof self.gameObjects[j].draw === 'undefined')
				continue;			
			self.gameObjects[j].draw();
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