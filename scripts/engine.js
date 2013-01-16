function MainLoop() {
	this.fps = 50; //draw loops per second
	this.ups = 20; //update loops per second
	
	this.gameObjects = [];	
	this.globals = [];
	this.pressedKeys = [];
	
	var self = this;
	
	var keyCodeMapper = function(keyCode) {
		switch (keyCode) {
			case 37: return 'w';
			case 38: return 'n';
			case 39: return 'e';
			case 40: return 's';
			case 87: return 'W';
			case 83: return 'S';
			case 65: return 'A';
			case 68: return 'D';
			default: return null;
		};
	};
	
	/*	Take a look at http://jsfiddle.net/HwR9N/3/
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
		
		/*if (pressedKey != null)
			self.pressedKeys.push(pressedKey);*/
		
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
	
	this.run = function() {		
		document.onkeydown = keyDownHandler;
		document.onkeyup = keyUpHandler;
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
}

new MainLoop().run();