window.requestAnimFrame = window.mozRequestAnimationFrame

var d = document.createElement('div');
var b = document.getElementsByTagName('body')[0];
b.appendChild(d);
d.style.width = '100px';
d.style.height = '100px';
d.style.backgroundColor = "Black";

var increase = false;

(function loop1() {
	var d = document.getElementsByTagName('div')[0];
	var w = parseInt(d.style.width);
	
	if (w < 1) {
		increase = true;
	}
	else if (w > 99) {
		increase = false;
	}
	
	if (increase) {
		w++;
	}
	else {
		w--;
	}
	
	d.style.width = w + 'px';
	
	
	window.requestAnimFrame(loop1);	
})();