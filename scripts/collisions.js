/*
TODO: Warning! Right now PossibleCollisions works bad for different directions. When red (first) tank approaches blue from up and left 		sides - collision detection works only after them get into each other.
TODO: Make it to be a part of engine. We may send function pointer to objects' update functions and it will save us from
	sending tileMaps, canvas, etc.
*/

function PossibleCollisions(objectToCheck, tilesMapTanks, canvas, tilesMapWalls) {
	/*Dirty fix for the case when tilesMapTanks is empty (happens on the very first loop with AI tank that starts it's movement 
		in that loop). As a solution - make a pause between first movement and collision check start. I mean don't check collisions 
		at the fist loop.*/
	if(objectToCheck === undefined || tilesMapTanks === undefined || tilesMapTanks.length < 1) return undefined;		

	var tankTileId = GetTankTile(objectToCheck, canvas);
	var dir = objectToCheck.direction;

	/*this trash with direction is used to prevent checks with objects, that are beyond current object.*/
	/*TODO: Refactor it!*/
	if(objectToCheck.getPosition()[0] < objectToCheck.getSize()[0] / 2
		|| objectToCheck.getPosition()[0] > canvas.offsetWidth - objectToCheck.getSize()[0] / 2
		|| objectToCheck.getPosition()[1] < objectToCheck.getSize()[1] / 2
		|| objectToCheck.getPosition()[1] > canvas.offsetHeight - objectToCheck.getSize()[1] / 2) {		
		return new MapBorder();
	}

	var tilesX = [tankTileId[0] - 1 < 0 ? 0 : (dir == 'w' || dir == 's' || dir == 'n' ? tankTileId[0] - 1 : tankTileId[0])
				, tankTileId[0] + 1 > tilesMapTanks.length - 1 ? tilesMapTanks.length - 1 : (dir == 'e' || dir == 's' || dir == 'n' ? tankTileId[0] + 1 : tankTileId[0])];
	var tilesY = [tankTileId[1] - 1 < 0 ? 0 : (dir == 'n' || dir == 'e' || dir == 'w' ? tankTileId[1] - 1 : tankTileId[1])
				, tankTileId[1] + 1 > tilesMapTanks[1].length - 1? tilesMapTanks[0].length - 1 : (dir == 's' || dir == 'e' || dir == 'w' ? tankTileId[1] + 1 : tankTileId[1])];
	
	var possibleCollisions = [];
	for (var i = tilesX[0]; i <= tilesX[1]; i++) {
		for (var j = tilesY[0]; j <= tilesY[1]; j++) {
			if (tilesMapTanks[i][j] === undefined) {
				console.log('[' + i + ';' + j + ']');
				console.log(tilesMapTanks.length + 'x' + tilesMapTanks[1].length);
				console.info(tilesMapTanks);
			};
			if(tilesMapTanks[i][j].length > 0) {
				for(var k = 0; k < tilesMapTanks[i][j].length; k++) {					
					if(tilesMapTanks[i][j][k].id != objectToCheck.id) {
						possibleCollisions.push(tilesMapTanks[i][j][k]);					
					};
				};
			};
			if(typeof tilesMapWalls[i] !== 'undefined' && typeof tilesMapWalls[i][j] !== 'undefined') {
				possibleCollisions.push(tilesMapWalls[i][j]);
			};
		}
	};

	i = 0;	

	if (possibleCollisions.length > 0) {
		for (var i = 0; i < possibleCollisions.length; i++) {
			var obstacle = CheckCollision(objectToCheck, possibleCollisions[i]);
			if (obstacle !== undefined && typeof obstacle.hit === 'function') {				
				return obstacle;				
			};
		};		
	};
	return undefined;
};

function GetTankTile(objectToCheck, canvas) {
	var canvasSize = [canvas.offsetWidth, canvas.offsetHeight];		
	return [(objectToCheck.getPosition()[0] / tankSize[0]) |0, (objectToCheck.getPosition()[1] / tankSize[1]) |0];
};

function CheckCollision(t1, t2) {	
	var left = t1.getPosition()[0] > t2.getPosition()[0] ? t2 : t1;
	var right = left == t1 ? t2 : t1;
	var upper = t1.getPosition()[1] > t2.getPosition()[1] ? t2 : t1;
	var lower = upper == t1 ? t2 : t1;
	var horisontalCollision = right.getPosition()[0] - left.getPosition()[0] <= left.getSize()[0] / 2 + right.getSize()[0] / 2;
	var verticalCollision = lower.getPosition()[1] - upper.getPosition()[1] <= upper.getSize()[1] / 2 + lower.getSize()[1] / 2;
	if (horisontalCollision && verticalCollision) {
		console.log(t1.id + ' collides with ' + t2.id);
		return t2; //Object that is an obstacle;
	};
	return undefined;
}