// Move it to separate utils.js file!!!
function RandomFromRange(min, max) {
	if (min === undefined || max === undefined)
		return undefined;
	var range = max - min;
	var step = 1 / range;
	var rndResult = Math.random() /  step;
	return Math.floor(rndResult);
};