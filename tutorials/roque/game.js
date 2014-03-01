var FONTSIZE = 32;
var ROWS = 10, COLS = 15;
var ACTORS = 10;

var map;
var screen;

var player;
var acted;
var actorList;
var livingEnemies;

var actorMap;

var game = new Phaser.Game(
    COLS * FONTSIZE * 0.6,
    ROWS * FONTSIZE,
    Phaser.AUTO,
    '',
    { create: create }
);

function create() {
	game.input.keyboard.addCallbacks(null, null, onKeyUp);
	
	initMap();
	
	// initialize screen
	screen = [];
	
	for (var y=0; y<ROWS; y++) {
		var newRow = [];
		
		screen.push(newRow);
		
		for (var x=0; x<COLS; x++) {
			newRow.push(initCell('', x, y));
		}
	}
	
	initActors();
	
	drawMap();
	drawActors();
}

function onKeyUp(event) {
	switch (event.keyCode) {
		case Phaser.Keyboard.LEFT:
			acted = moveTo(player, {x:-1, y:0});
			break;
			
		case Phaser.Keyboard.RIGHT:
			acted = moveTo(player,{x:1, y:0});
			break;
			
		case Phaser.Keyboard.UP:
			acted = moveTo(player, {x:0, y:-1});
			break;
		
		case Phaser.Keyboard.DOWN:
			acted = moveTo(player, {x:0, y:1});
			break;
	}

	if (acted) {
		for (var enemy in actorList) {
			// skip the player
			if(enemy==0) {
				continue;
			}

			var e = actorList[enemy];
			if (e != null) {
				aiAct(e);
			}
		}
	}
	
	drawMap();
	drawActors();
}

function initMap() {
	map = [];
	
	for (var y=0; y<ROWS; y++) {
		var newRow = [];
		
		for (var x=0; x<COLS; x++) {
			if (Math.random() > 0.8) {
				newRow.push('#');
			} else {
				newRow.push('.');	
			}
		}
		
		map.push(newRow);
	}
}

function drawMap() {
    for (var y=0; y<ROWS; y++) {
        for (var x=0; x<COLS; x++) {
            screen[y][x].content = map[y][x];
		}
	}
}

function initCell(chr, x, y) {
	// add a single cell in a given position to the ascii display
	var style = { 
		font: FONTSIZE + "px monospace",
		fill:"#fff"
	};
	
	return game.add.text(
		FONTSIZE*0.6*x,
		FONTSIZE*y,
		chr,
		style
	);
}

function randomInt(max) {
   return Math.floor(Math.random() * max);
}

function initActors() {
	// create actors at random locations
	actorList = [];
	actorMap = {};
	
	for (var e=0; e<ACTORS; e++) {
		// create new actor
		var actor = { 
			x: 0, 
			y: 0, 
			hp: e == 0 ? 3 : 1 
		};
		do {
			// pick a random position that is both a floor and not occupied
			actor.y=randomInt(ROWS);
			actor.x=randomInt(COLS);
		} while (map[actor.y][actor.x] == '#' || actorMap[actor.y + "_" + actor.x] != null );

		// add references to the actor to the actors list & map
		actorMap[actor.y + "_" + actor.x]= actor;
		actorList.push(actor);
	}

	// the player is the first actor in the list
	player = actorList[0];
	livingEnemies = ACTORS-1;
}

function drawActors() {
	for (var a in actorList) {
		if (actorList[a] != null && actorList[a].hp>0) {
			screen[actorList[a].y][actorList[a].x].content = a == 0 ? '' + player.hp : 'e';
		}
	}
}

function canGo(actor,dir) {
    return actor.x+dir.x >= 0 &&
        actor.x+dir.x <= COLS - 1 &&
		actor.y+dir.y >= 0 &&
        actor.y+dir.y <= ROWS - 1 &&
        map[actor.y+dir.y][actor.x +dir.x] == '.';
}

function moveTo(actor, dir) {
	// check if actor can move in the given direction
	if (!canGo(actor,dir)) {
		return false;
	}
	
	// moves actor to the new location
	var newKey=(actor.y+dir.y)+'_'+(actor.x+dir.x);
	
	// if the destination tile has an actor in it
	if (actorMap[newKey] != null) {
		// decrement hitpoints of the actor at the destination tile
		var victim=actorMap[newKey];
		victim.hp--;

		// if it's dead remove its reference
		if (victim.hp == 0) {
			actorMap[newKey]= null;
			actorList[actorList.indexOf(victim)]=null;
			
			if(victim!=player) {
				livingEnemies--;
				
				if (livingEnemies == 0) {
					// victory message
					var victory = game.add.text(
						game.world.centerX,
						game.world.centerY,
						'Victory!\nCtrl+r to restart',
						{ fill : '#2e2', align: "center" }
					);
					
					victory.anchor.setTo(0.5,0.5);
				}
			}
		}
	} else {
		// remove reference to the actor's old position
		actorMap[actor.y + '_' + actor.x]= null;

		// update position
		actor.y+=dir.y;
		actor.x+=dir.x;

		// add reference to the actor's new position
		actorMap[actor.y + '_' + actor.x]=actor;
	}
	return true;
}

function aiAct(actor) {
	var directions = [
		{ x: -1, y:0 },
		{ x:1, y:0 },
		{ x:0, y: -1 },
		{ x:0, y:1 }
	];
	
	var dx = player.x - actor.x;
	var dy = player.y - actor.y;

	// if player is far away, walk randomly
	if (Math.abs(dx) + Math.abs(dy) > 6) {
		// try to walk in random directions until you succeed once
		while (!moveTo(actor, directions[randomInt(directions.length)])) { };
	}
	
	// otherwise walk towards player
	if (Math.abs(dx) > Math.abs(dy)) {
		if (dx<0) {
			// left
			moveTo(actor, directions[0]);
		} else {
			// right
			moveTo(actor, directions[1]);
		}
	} else {
		if (dy < 0) {
			// up
			moveTo(actor, directions[2]);
		} else {
			// down
			moveTo(actor, directions[3]);
		}
	}
	
	if (player.hp<1) {
		// game over message
		var gameOver = game.add.text(
			game.world.centerX,
			game.world.centerY,
			'Game Over\nCtrl+r to restart',
			{ fill : '#e22', align: "center" }
		);
		gameOver.anchor.setTo(0.5,0.5);
	}
}