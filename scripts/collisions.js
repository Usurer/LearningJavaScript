/*
TODO: Warning! Right now PossibleCollisions works bad for different directions. When red (first) tank approaches blue from up and left sides - collision detection works only after them get into each other.
*/

function PossibleCollisions(tank, tilesMapTanks, canvas) {
	var tankTileId = GetTankTile(tank, canvas);
	var dir = tank.direction;

	/*this trash with direction is used to prevent checks with objects, that are beyond current object.*/
	/*TODO: Refactor it!*/
	var tilesX = [tankTileId[0] - 1 < 0 ? 0 : (dir == 'w' || dir == 's' || dir == 'n' ? tankTileId[0] - 1 : tankTileId[0])
				, tankTileId[0] + 1 > tilesMapTanks.length - 1 ? tilesMapTanks.length - 1 : (dir == 'e' || dir == 's' || dir == 'n' ? tankTileId[0] + 1 : tankTileId[0])];
	var tilesY = [tankTileId[1] - 1 < 0 ? 0 : (dir == 'n' || dir == 'e' || dir == 'w' ? tankTileId[1] - 1 : tankTileId[1])
				, tankTileId[1] + 1 > tilesMapTanks[1].length + 1 ? tilesMapTanks[0].length + 1 : (dir == 's' || dir == 'e' || dir == 'w' ? tankTileId[1] + 1 : tankTileId[1])];

	//console.log('collide for #' + tank.id);
	//console.log('looks at ' + tilesX[0] + ' to ' + tilesX[1] + ' and ' + tilesY[0] + ' to ' + tilesY[1]);
	var possibleCollisions = [];
	for (var i = tilesX[0]; i <= tilesX[1]; i++) {
		for (var j = tilesY[0]; j <= tilesY[1]; j++) {
			if(tilesMapTanks[i][j].length > 0) {
				for(var k = 0; k < tilesMapTanks[i][j].length; k++) {
					/*console.log('Tank#' + tank.id + ' had found ' + tilesMapTanks[i][j].length + ' tanks ' + 
						 ' on position [' + i + '][' + j + ']');*/
					if(tilesMapTanks[i][j][k].id != tank.id) {
						possibleCollisions.push(tilesMapTanks[i][j][k]);
						//console.log('Tank#' + tank.id + ' collides with #' + tilesMapTanks[i][j][k].id);
					}
				}
			}
		}
	};

	i = 0;	

	if (possibleCollisions.length > 0) {
		for (var i = 0; i < possibleCollisions.length; i++) {
			if (CheckCollision(tank, possibleCollisions[i])) return true;
		}		
	}
	return false;

	//if (possibleCollisions.length > 0) return true;
	//for(i; i < possibleCollisions.length; i++) console.info(possibleCollisions[i]);
};

function GetTankTile(tank, canvas) {
	var canvasSize = [canvas.offsetWidth, canvas.offsetHeight];		
	return [(tank.getPosition()[0] / /*tank.getSize()[0]*/50) |0, (tank.getPosition()[1] / /*tank.getSize()[1]*/50) |0];
};

function CheckCollision(t1, t2) {
	var left = t1.getPosition()[0] > t2.getPosition()[0] ? t2 : t1;
	var right = left == t1 ? t2 : t1;
	var upper = t1.getPosition()[1] > t2.getPosition()[1] ? t2 : t1;
	var lower = upper == t1 ? t2 : t1;
	var horisontalCollision = right.getPosition()[0] - left.getPosition()[0] <= left.getSize()[0] / 2 + right.getSize()[0] / 2;
	var verticalCollision = lower.getPosition()[1] - upper.getPosition()[1] <= upper.getSize()[1] / 2 + lower.getSize()[1] / 2;
	if (horisontalCollision && verticalCollision) return true;
	return false;
}