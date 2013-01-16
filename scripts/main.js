function FirstChild() {
	this.name = "First Child";
	this.tellName = "My name is" + this.name;	
}

function Parent() {
	this.name = "Parent";
	this.race = "Black, mothafucka!";
	this.setRace = function(race) {
		this.race = race + ", mothafucka";
	};
}

FirstChild.prototype = new Parent();
FirstChild.prototype.constructor = FirstChild;

var firstChild_1 = new FirstChild();
console.log(firstChild_1.name + " is " + firstChild_1.race);
firstChild_1.setRace('White');
console.log(firstChild_1.name + " is " + firstChild_1.race);
var firstChild_2 = new FirstChild();
console.log(firstChild_2.name + " is " + firstChild_2.race);