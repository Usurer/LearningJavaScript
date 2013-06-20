window.tankSize = [30,30];
function MainLoop() {
	this.fps = 50; //draw loops per second
	this.ups = 20; //update loops per second
	
	this.gameObjects = [];		
	this.globals = [];
	this.pressedKeys = [];
	this.tanks = [];
	this.missiles = [];
	this.deadObjects = [];
	this.tileMapTanks = [];
	this.tileMapWalls = [];
	
	this.listForest = []; //list of forest tiles
	
	this.currentId = 0; //the biggest actual object Id
	this.paused = false; // game is paused if set to true

	this.perfomanceCounterMax = 0;
	this.perfomanceCounterMin = 999999;

	this.playerSpawnPoints = [];
	this.enemySpawnPoints = [];

	this.enemiesToRespawn = 10;
	// second stores const. value, first one is to be used as a counter (I just don't want to have two variables)
	this.enemiesRespawnTimeout = [this.fps * 10, this.fps * 10]; 
	
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
			case 80: return 'pause'; //P
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
		//console.log(e.keyCode);
		var pressedKey = keyCodeMapper(e.keyCode);
		
		if (pressedKey != null) {
			for (i = 0; i < self.pressedKeys.length; i++) {
				if (self.pressedKeys[i] === pressedKey) {
					return;
				}				
			}
			if (pressedKey === 'pause') self.paused = !self.paused; //this is a special case - game is set to pause
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

	/*	
	TODO:
	Important!
	What should be done!!! This callback should be removed and collisions processor shoud call hit() function of the object
	that was hit. If this object explodes, then it doesn't create a new object, but changes it's draw() behaviour. And only after all
	proper things, like animation, would be finished, the object will put itself to Dead state.*/
	this.updateCallback = function(updateResult) {
		if (updateResult !== undefined) {
			if(typeof updateResult.hit !== 'function') return;
			var newObject = updateResult.hit();
			if (newObject !== undefined) {
				newObject.id = self.gameObjects.length;
				self.gameObjects.push(newObject);
			}
			
		};
	}

	this.createWall = function(pos) {
		var wall = new Wall();				
		wall.initialize(pos, tankSize, 'brick.png', 'Green');		

		/*var canvasWH = [document.getElementById('canvas').offsetWidth, document.getElementById('canvas').offsetHeight];
		var tileMapWallsWidth = (canvasWH[0] / wall.getSize()[0]) |0;
		var tileMapWallsHeight = (canvasWH[1] / wall.getSize()[1]) |0;*/

		var posX = (wall.getPosition()[0] / tankSize[0]) |0;
		var posY = (wall.getPosition()[1] / tankSize[1]) |0;

		if (typeof self.tileMapWalls[posX] === 'undefined') self.tileMapWalls[posX] = [];
		self.tileMapWalls[posX][posY] = wall;
		wall.id = 'w_' + posX + '_' + posY;
	};

	this.createForest = function(pos) {
		var forest = new Sprite();				
		forest.initialize(pos, tankSize, 'forest.png', 'transparent');				

		var posX = (forest.getPosition()[0] / tankSize[0]) |0;
		var posY = (forest.getPosition()[1] / tankSize[1]) |0;
		
		forest.id = 'f_' + posX + '_' + posY;
		self.listForest.push(forest);		
	};

	this.createTank = function(id, commandsMap, coords, color) {
		var newTank = new Tank(id);
		newTank.setCommandsMap(commandsMap);
		newTank.initialize(coords, tankSize, 'tank_30x30_n.png', color);
		self.gameObjects[newTank.id] = newTank;
		self.tanks[newTank.id] = newTank;
	};

	this.createFirstTank = function() {		
		var map = {'S': 'setDirection', 'N': 'setDirection', 'E': 'setDirection', 'W': 'setDirection', 'SPACE': 'fire'};
		var coord = self.playerSpawnPoints.length > 0 ? self.playerSpawnPoints[0] : [100,500];
		self.createTank(0, map, coord, 'Red');		
	};

	this.createSecondTank = function() {		
		var map = {'s': 'setDirection', 'n': 'setDirection', 'e': 'setDirection', 'w': 'setDirection', 'RCTRL': 'fire'};
		self.createTank(1, map, [500, 700], 'Blue');				
	};		

	this.createAiTank = function(pos) {
		//If no coordinates set - use spawn points
		if (pos === undefined) {			
			pos = undefined;
			
			/*Hey! I want a spawn point to be selected ramdomly!			
			So I'm gonna try to get random spawn point as many times as many spawn point exist. It's not precise, but good enough.*/
			var i = self.enemySpawnPoints.length;
			var randomPoint = 0

			while (i > 0) {
				randomPoint = RandomFromRange(0, self.enemySpawnPoints.length); // taken from utils.js
				for (var j = 0; j < self.tanks.length; j++) {
					if(self.tanks[j] instanceof Tank) {
						var tooCloseX = Math.abs(self.enemySpawnPoints[randomPoint][0] - self.tanks[j].getPosition()[0]) < (2 * tankSize[0]);
						var tooCloseY = Math.abs(self.enemySpawnPoints[randomPoint][1] - self.tanks[j].getPosition()[1]) < (2 * tankSize[1]);
						if(tooCloseX && tooCloseY) {
							/*If any tank is too close - search for another spawner. 
							If pos is set already it will reset the value, because it's wrong.*/
							pos = undefined
							break;
						};						
						pos = self.enemySpawnPoints[randomPoint];					
					};
				};
				/*If position is set - don't search for another spawn points*/
				if (pos !== undefined) break;
				i = i - 1;
			};
		};
		
		if (pos === undefined) 
			return;
		var newTank = new TankAI(self.gameObjects.length);
		newTank.initialize(pos, tankSize, 'tank_ai_30x30_n.png', 'White');
		self.gameObjects[newTank.id] = newTank;
		self.tanks[newTank.id] = newTank;	
	};	

	this.draw = function() {				
		//console.log('tick');		
		var startTime = (new Date()).valueOf();
		
		/*We want to write status info before the main draw in case it will be passed by for a paused game*/
		(new DebuggingMessage()).statusMsg(self.paused); 
		/* if the game's on pause we just won't update objects*/
		if (self.paused) {
			setTimeout(self.draw, timeout); 
			return;
		};

		if(self.enemiesToRespawn > 0 && self.enemiesRespawnTimeout[0] === 0) {
			self.createAiTank();			
			self.enemiesToRespawn = self.enemiesToRespawn - 1;
			self.enemiesRespawnTimeout[0] = self.enemiesRespawnTimeout[1];
		}
		else {
			self.enemiesRespawnTimeout[0] = self.enemiesRespawnTimeout[0] - 1;
		}
		
		/*Here are the bad news - we cannot fire missile from the Tank class in current object model realization, because only game engine has access to gameObjects, globals etc. I see three ways to solve the problem:
		1. This is what I've started to do first - if 'fire' is pressed, then game engine will emulate the fire.
		2. Move object arrays to the outer scope - make 'em really global and access 'em from Tank.
		3. When Tank processes commands it will create the array of results. If the result of command is a new object it will be added to this array. Then array is returned to engine and objects from it are moved to gameObjects array. That what I'll try to do now.
		*/

		var newObjects = [];
		var canvas = document.getElementById('canvas');		
		var i = j = k = l = m = n = 0; /*Initializing For loops counters.*/	

		var deadWalls = [];
		for(var wallsCounterX = 0; wallsCounterX < self.tileMapWalls.length; wallsCounterX++) {
			if(typeof self.tileMapWalls[wallsCounterX] === 'undefined') continue;
			for(var wallsCounterY = 0; wallsCounterY < self.tileMapWalls[wallsCounterX].length; wallsCounterY++) {
				if(typeof self.tileMapWalls[wallsCounterX][wallsCounterY] !== 'undefined') 					
					if (self.tileMapWalls[wallsCounterX][wallsCounterY].dead == false)
						self.tileMapWalls[wallsCounterX][wallsCounterY].draw(canvas);
					else deadWalls.push([wallsCounterX, wallsCounterY]);					
			};
		};

		for (var deadWallsCounter = 0; deadWallsCounter < deadWalls.length; deadWallsCounter++) {
			self.tileMapWalls[deadWalls[deadWallsCounter][0]][deadWalls[deadWallsCounter][1]].remove(canvas);
			self.tileMapWalls[deadWalls[deadWallsCounter][0]][deadWalls[deadWallsCounter][1]] = undefined;
		};

		for(var f = 0; f < self.listForest.length; f++) {
			self.listForest[f].draw(canvas, [['zIndex', '10']]);
		};
		
		for (var j = 0; j < self.gameObjects.length; j++) {
			if(typeof self.gameObjects[j] === 'undefined') 
				continue;
			/*if result of command processing is an object - it should be added to special collection - in current
			realization it's a missile. Don't know if it will be changed, but now it is as it is.*/
			if(typeof self.gameObjects[j].receiveCommands !== 'undefined') {
				/*A trick to join two arrays without a new array creation (as concat does). It's also faster than concat. 
				See also: http://jsperf.com/concat-vs-push-apply/11 */			
				if(self.gameObjects[j] instanceof TankAI) {
					newObjects.push.apply(newObjects, self.gameObjects[j].receiveCommands(self.tanks));
				}
				else {
					newObjects.push.apply(newObjects, self.gameObjects[j].receiveCommands(self.pressedKeys));
				}
			};

			if(typeof self.gameObjects[j].update !== 'undefined') {
				if (self.gameObjects[j] instanceof Tank || self.gameObjects[j] instanceof Missile) {										
					var isStuck = !(self.gameObjects[j].update(PossibleCollisions
						, [self.gameObjects[j], self.tileMapTanks, canvas, self.tileMapWalls]));
					if(self.gameObjects[j] instanceof TankAI && isStuck === true) {
						self.gameObjects[j].changeDirection();
					};
				}
				else {
					self.gameObjects[j].update(); //TODO: I don't know what is it here for, so check it, pls.
				}
			}

			if(typeof self.gameObjects[j].draw === 'undefined')
				continue;	

			
			self.gameObjects[j].draw(canvas);			

		};
		j = 0; //clear the counter

		/*Now we check all 'fresh' objects (missiles), assign ID's and put them to the gameObjects storage.*/
		if (newObjects.length > 0) {
			for (var i = 0; i < newObjects.length; i++) {
				if (typeof newObjects[i] === 'undefined')
					continue;
				
				if (typeof newObjects[i].id === 'undefined') {
					//newObjects[i].id = self.gameObjects.length + i > currentId ? self.gameObjects.length + i : ++currentId;				
					newObjects[i].id = ++self.currentId;				
				};

				self.gameObjects.push(newObjects[i]);
			};			
			/*self.gameObjects.push.apply(self.gameObjects, newObjects); - it will also add 'undefined' values to gameObjects, so don't use it;*/
		};

		i = 0;
		/*Now I want remove dead objects from the gameObjects list. Dead object is the one that should be removed from the game, like finished tank burst animation etc.*/
		for (var i = 0; i < self.gameObjects.length; i++) {
			if(typeof self.gameObjects[i] === 'undefined')
				continue;
			if(self.gameObjects[i].dead === true)
			{
				self.deadObjects.push(self.gameObjects[i]);				

				if(self.gameObjects[i] instanceof Tank) {
					console.log('Tank with ID ' + self.gameObjects[i].id + ' should be removed');
					if (self.tanks[self.gameObjects[i].id] !== undefined) {						
						self.tanks[self.gameObjects[i].id] = undefined;
						console.log('Tank with ID ' + self.gameObjects[i].id + ' had been set to undefined');
					};
				};

				self.gameObjects[i] = undefined;
			}
			
		};
		i = 0;
		
		for (var i = 0; i < self.deadObjects.length; i++) {
			var el = document.getElementById(self.deadObjects[i].id);
			if (el === null) {
				console.info(self.deadObjects[i]); 
				console.error('el is null'); 
				continue;
			};
			if (el.parentElement == canvas)
				canvas.removeChild(el);
		};
		i = 0;
		self.deadObjects = []; //clearing container

		/*Removing all dead (and set to undefined) elements from gameObjects.*/
		var indexOfUndefined = self.gameObjects.indexOf(undefined);
		while(indexOfUndefined >= 0) {
			self.gameObjects.splice(indexOfUndefined, 1);
			indexOfUndefined = self.gameObjects.indexOf(undefined);
		};

		/*What I do below is saving tanks objects to tile map in accordance with tanks' positions.
		There is an assumption that canvas.width / tank.width is an integer. */		
		self.tileMapTanks = [];
		var canvasWH = [document.getElementById('canvas').offsetWidth, document.getElementById('canvas').offsetHeight];
		var tileMapTanksWidth = (canvasWH[0] / tankSize[0]) |0;
		var tileMapTanksHeight = (canvasWH[1] / tankSize[1]) |0;
		for(var i = 0; i < tileMapTanksWidth; i++) {
			var column = new Array(tileMapTanksHeight);
			for (var c = 0; c < column.length; c++) column[c] = [];
			self.tileMapTanks[i] = column;
		};
		i = 0;
		for (var tankIndex = 0; tankIndex < self.tanks.length; tankIndex++) {
			if (self.tanks[tankIndex] === undefined) continue;
			var tank = self.tanks[tankIndex];
			var tankTileCoord = [(tank.getPosition()[0] / tankSize[0]) |0, (tank.getPosition()[1] / tankSize[1]) |0];
			self.tileMapTanks[tankTileCoord[0]][tankTileCoord[1]].push(tank);
		};				

		//for (var t = 0; t < self.tanks.length; t++) PossibleCollisions(self.tanks[t], self.tileMapTanks, canvas);		

		/*Checking perfomance. Address perfomanceCounter variables from console if needed.*/
		var endTime = (new Date()).valueOf();
		var delta = endTime - startTime;
		if(self.perfomanceCounterMin > delta) self.perfomanceCounterMin = delta;
		if(self.perfomanceCounterMax < delta) self.perfomanceCounterMax = delta;
		(new DebuggingMessage()).perfomanceMsg(self.perfomanceCounterMin, self.perfomanceCounterMax, delta);

		var timeout = 1000 / self.fps;
		timeout = timeout > delta ? timeout - delta : timeout;

		setTimeout(self.draw, timeout);
	};

	this.initGame = function() {
		self.createMap();

		self.createFirstTank();
		//self.createSecondTank();	
		for (var i = 0; i < 4; i++) {
			self.createAiTank();		
		};
		
		self.currentId = self.gameObjects.length;
		
		document.onkeydown = keyDownHandler;
		document.onkeyup = keyUpHandler;

		new DebuggingMessage().textMsg(self.gameObjects.length);

		/*Set interval is bad because it creates a queue of calls - it's better use setTimeoute with callback. 
		http://shamansir.github.com/JavaScript-Garden/#other.timeouts*/		
		//var drawer = setTimeout(self.draw, 1000 / self.fps);
	};
	
	this.run = function() {		
		self.initGame();		
		if (!self.paused) setTimeout(self.draw, 1000 / self.fps);
			//setTimeout(self.pauseLoop, 100);
		//var drawer = setTimeout(self.draw, 1000 / self.fps);
		
	};

	this.createMap = function() {		
		var map = GetMap(); //taken mrom /maps/01.js file; it's content is copypasted from a map editor output;
		for (var i = 0; i < map.length; i++) {
			for (var j = 0; j < map[i].length; j++) {
				if(map[i][j][0] === 'brick') {
					self.createWall([i * tankSize[0] + tankSize[0] / 2, j * tankSize[0] + tankSize[0] / 2]);			
				};

				if(map[i][j][0] === 'forest') {
					self.createForest([i * tankSize[0] + tankSize[0] / 2, j * tankSize[0] + tankSize[0] / 2]);			
				};

				if(map[i][j][0] === 'player') {
					self.playerSpawnPoints.push([i * tankSize[0] + tankSize[0] / 2, j * tankSize[0] + tankSize[0] / 2]);
				};

				if(map[i][j][0] === 'enemy') {
					self.enemySpawnPoints.push([i * tankSize[0] + tankSize[0] / 2, j * tankSize[0] + tankSize[0] / 2]);
				};
			}
		}		
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
	};

	this.perfomanceMsg = function(min, max, last) {
		document.getElementById('perfomance').innerHTML = 'Min: ' + min + '</br>Max: ' + max + '</br>Last:' + last;	
	};

	this.statusMsg = function(paused) {
		document.getElementById('gameStatus').innerHTML = 'Game is ' 
			+ (paused ? 'paused' : 'active')
			+ ' press "P" to change.';
	};
}

var Loop = new MainLoop();
Loop.run();