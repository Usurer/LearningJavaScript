// You may read also http://nokarma.org/2011/02/02/javascript-game-development-the-game-loop/index.html

function myAnimation() {
	this.fps = 20; //draw loops per second
	this.ups = 2; //update loops per second
	
	var animatedObject = function(id) {
		this.width = 100;
		this.height = 100;
		this.background = "Black";
		this.id = typeof id === 'undefined' ? "myDiv" : id;
		var self = this;
		var increase = false;
		
		this.draw = function() {
			var el = document.getElementById(self.id);
			el.style.width = self.width + 'px';
			el.style.height = self.height + 'px';
			el.style.backgroundColor = self.background;			
		};
		
		this.update = function() {
			if (self.height < 1) {
				self.increase = true;
			} else if (self.height > 99){
				self.increase = false;
			}
			
			if (self.increase) {
				self.height++;
			} else {
				self.height--;
			}			
		};
	};
	
	var divToAnimate = document.getElementById('animateMe');
	if (typeof divToAnimate === 'undefined') { 
		alert("Bad, dude, bad!");
		return;
	}
	
	var animated = new animatedObject('animateMe');	
	
	/*	There is another solution also - to put change run() function by implementing logic
		of update/draw loops proportion inside of it and then writing setInterval(run, 0).*/
	this.run = function() {
		// Actually there is no need to make more updates then draws, though some use interpolation.
		var updater = setInterval(animated.update, 1000 / this.ups);
		var drawer = setInterval(animated.draw, 1000 / this.fps);
	};
}

new myAnimation().run();