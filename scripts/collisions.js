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

	var simplifiedCollisions = false;
	if (typeof simplifiedCollisions !== 'undefined' && simplifiedCollisions) {
		var possibleCollisions = [];

		for(var m = 0; m < tilesMapTanks.length; m++){
			if (tilesMapTanks[m] === undefined) continue;
			for(var n = 0; n < tilesMapTanks[m].length; n++){
				if (tilesMapTanks[m][n] !== undefined && tilesMapTanks[m][n].length > 0)
					possibleCollisions.push(tilesMapTanks[m][n]);
			};
		};
		m = n = 0;
		for(var m = 0; m < tilesMapWalls.length; m++){
			if (tilesMapWalls[m] === undefined) continue;
			for(var n = 0; n < tilesMapWalls[m].length; n++){
				if (tilesMapWalls[m][n] !== undefined && tilesMapWalls[m][n].length > 0)
					possibleCollisions.push(tilesMapWalls[m][n]);
			};
		};		
		if (possibleCollisions.length > 0) {
			for (var i = 0; i < possibleCollisions.length; i++) {
				if(objectToCheck.id === possibleCollisions[i].id) continue;
				var obstacle = CheckCollision(objectToCheck, possibleCollisions[i]);
				if (obstacle !== undefined) return obstacle;
			}		
		}
	};

	var tankTileId = GetTankTile(objectToCheck, canvas);
	var dir = objectToCheck.direction;

	/*this trash with direction is used to prevent checks with objects, that are beyond current object.*/
	/*TODO: Refactor it!*/
	if(objectToCheck.getPosition()[0] < objectToCheck.getSize()[0] / 2
		|| objectToCheck.getPosition()[0] > canvas.offsetWidth - objectToCheck.getSize()[0] / 2
		|| objectToCheck.getPosition()[1] < objectToCheck.getSize()[1] / 2
		|| objectToCheck.getPosition()[1] > canvas.offsetHeight - objectToCheck.getSize()[1] / 2)
		return true;

	var tilesX = [tankTileId[0] - 1 < 0 ? 0 : (dir == 'w' || dir == 's' || dir == 'n' ? tankTileId[0] - 1 : tankTileId[0])
				, tankTileId[0] + 1 > tilesMapTanks.length - 1 ? tilesMapTanks.length - 1 : (dir == 'e' || dir == 's' || dir == 'n' ? tankTileId[0] + 1 : tankTileId[0])];
	var tilesY = [tankTileId[1] - 1 < 0 ? 0 : (dir == 'n' || dir == 'e' || dir == 'w' ? tankTileId[1] - 1 : tankTileId[1])
				, tankTileId[1] + 1 > tilesMapTanks[1].length - 1? tilesMapTanks[0].length - 1 : (dir == 's' || dir == 'e' || dir == 'w' ? tankTileId[1] + 1 : tankTileId[1])];

	//console.log('collide for #' + objectToCheck.id);
	//console.log('looks at ' + tilesX[0] + ' to ' + tilesX[1] + ' and ' + tilesY[0] + ' to ' + tilesY[1]);
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
					/*console.log('objectToCheck#' + objectToCheck.id + ' had found ' + tilesMapTanks[i][j].length + ' tanks ' + 
						 ' on position [' + i + '][' + j + ']');*/
					if(tilesMapTanks[i][j][k].id != objectToCheck.id) {
						possibleCollisions.push(tilesMapTanks[i][j][k]);
						//console.log('objectToCheck#' + objectToCheck.id + ' collides with #' + tilesMapTanks[i][j][k].id);
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
			if (obstacle !== undefined) return obstacle;
		}		
	}
	return undefined;

	//if (possibleCollisions.length > 0) return true;
	//for(i; i < possibleCollisions.length; i++) console.info(possibleCollisions[i]);
};

function GetTankTile(objectToCheck, canvas) {
	var canvasSize = [canvas.offsetWidth, canvas.offsetHeight];		
	return [(objectToCheck.getPosition()[0] / /*objectToCheck.getSize()[0]*/tankSize[0]) |0, (objectToCheck.getPosition()[1] / /*objectToCheck.getSize()[1]*/tankSize[1]) |0];
};

function CheckCollision(t1, t2) {
	//This is a dirty hack for a bug that appears during simpleCollisions algorithm processing.
	if (typeof t2.getPosition !== 'function') {
		//console.info(t2);
		//console.info(t2.getPosition);
		//console.info(t2.getPosition());
		return undefined;
	};

	var left = t1.getPosition()[0] > t2.getPosition()[0] ? t2 : t1;
	var right = left == t1 ? t2 : t1;
	var upper = t1.getPosition()[1] > t2.getPosition()[1] ? t2 : t1;
	var lower = upper == t1 ? t2 : t1;
	var horisontalCollision = right.getPosition()[0] - left.getPosition()[0] <= left.getSize()[0] / 2 + right.getSize()[0] / 2;
	var verticalCollision = lower.getPosition()[1] - upper.getPosition()[1] <= upper.getSize()[1] / 2 + lower.getSize()[1] / 2;
	if (horisontalCollision && verticalCollision) return t2; //Object that is an obstacle;
	return undefined;
}