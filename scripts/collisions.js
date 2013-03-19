function PossibleCollisions(tank, tilesMapTanks, canvas) {
	var tankTileId = GetTankTile(tank, canvas);
	var tilesX = [tankTileId[0] - 1 < 0 ? 0 : tankTileId[0] - 1
				, tankTileId[0] + 1 > tilesMapTanks.length - 1 ? tilesMapTanks.length - 1 : tankTileId[0] + 1];
	var tilesY = [tankTileId[1] - 1 < 0 ? 0 : tankTileId[1] - 1
				, tankTileId[1] + 1 > tilesMapTanks[1].length + 1 ? tilesMapTanks[0].length + 1 : tankTileId[1] + 1];

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
						console.log('Tank#' + tank.id + ' collides with #' + tilesMapTanks[i][j][k].id);
					}

				}
			}
		}
	};

	i = 0;	

	//for(i; i < possibleCollisions.length; i++) console.info(possibleCollisions[i]);
}

function GetTankTile(tank, canvas) {
	var canvasSize = [canvas.offsetWidth, canvas.offsetHeight];		
	return [(tank.getPosition()[0] / tank.getSize()[0]) |0, (tank.getPosition()[1] / tank.getSize()[1]) |0];
}