// Initialize Phaser, and creates a 400x490px game
var game = new Phaser.Game(1088, 832, Phaser.AUTO, 'game_div');

var map; // the tilemap
var tiles; // the spritemap
var player_sprite, enemy_sprite, sword_sprite;
var player; // the player, of course
var enemy;
var layer;
var space_key;
var timer;

var sfx_background;
var sfx_effect;
var sfx_victory;

var main_state = {

    preload: function () {
		this.game.load.tilemap('map', 'assets/gfx/map.json', null, Phaser.Tilemap.TILED_JSON);
		
		this.game.load.image('tiles', 'assets/gfx/dungeon.png', 16, 16);
		
		this.game.load.spritesheet('player_sprite', 'assets/gfx/sprite.png', 32, 32);
		this.game.load.spritesheet('enemy_sprite', 'assets/gfx/monster.png', 32, 32);
		this.game.load.spritesheet('sword_sprite', 'assets/gfx/effects.png', 64, 64);
		
		this.game.load.audio('sword', 'assets/sfx/sword.ogg');  
		this.game.load.audio('background', 'assets/sfx/background.ogg');    
		this.game.load.audio('victory', 'assets/sfx/victory.ogg');
    },

    create: function() { 
  		this.game.stage.backgroundColor = '#000000';

		map = this.game.add.tilemap('map');		
 		map.addTilesetImage('world_1','tiles');
		
		map.setCollisionBetween(167, 168);

		layer = map.createLayer('background');
		layer.resizeWorld();
		
		objects = map.createLayer('objects');
		objects.resizeWorld();
		
		//layer.debug = true;
		
		player = this.game.add.sprite(500, 360, 'player_sprite');
		
		player.animations.add('down', [0, 1, 2], 10, true);
		player.animations.add('left', [12, 13, 14], 10, true);
		player.animations.add('right', [24, 25, 26], 10, true);	
		player.animations.add('up', [36, 37, 38], 10, true);	
		
		player.animations.add('hit', [96, 97, 98], 10, true);	
		player.animations.add('idle', [0], 10, true);
		
		player.body.collideWorldBounds = true;
		
		enemy = this.game.add.sprite(700, 560, 'enemy_sprite');
		
		enemy.animations.add('down', [0, 1, 2], 10, true);
		enemy.animations.add('left', [12, 13, 14], 10, true);
		enemy.animations.add('right', [24, 25, 26], 10, true);	
		enemy.animations.add('up', [36, 37, 38], 10, true);	
		
		enemy.body.collideWorldBounds = true;
		
		this.timer = this.game.time.events.loop(
 			3000,
 			this.update_enemy,
 			this
 		);
		
		this.update_enemy();
		
		sfx_background = this.game.add.audio('background', 0.5, true, true); 
		sfx_effect = this.game.add.audio('sword'); 
		sfx_victory = this.game.add.audio('victory'); 
			
		sfx_background.play();
		
		cursors = this.game.input.keyboard.createCursorKeys();
		
		var space_key = this.game.input.keyboard.addKey(
			Phaser.Keyboard.SPACEBAR
		);
		
		space_key.onDown.add(this.hit, this);
		
		this.game.add.text(
			20,
			805,
			'Catch the bat. SPACE for hit, Cursors for Movement',
			{ fill : '#fff', align: "center", font: "19px Verdana", }
		);
	},
    
    update: function() {
		this.game.physics.collide(player, layer);
		this.game.physics.collide(enemy, layer, this.update_enemy);

		this.update_player();
	},
	
	update_enemy: function() {

		var x = Math.floor(Math.random()*5) + 100;
		x *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
		
		var y = Math.floor(Math.random()*5) + 50;
		y *= Math.floor(Math.random()*2) == 1 ? 1 : -1;

		enemy.body.velocity.x = x;  
		enemy.body.velocity.y = y; 
		
		if (x < 0) {
			enemy.animations.play('left');	
		} else {
			enemy.animations.play('right');	
		}
	},
	
	update_player: function() {
		player.body.velocity.x = 0;
		player.body.velocity.y = 0;
		
		if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			return;	
		}
		
		if (cursors.left.isDown)
		{
			player.body.velocity.x = -150;        
			player.animations.play('left');
		}
		else if (cursors.right.isDown)
		{
			player.body.velocity.x = 150;        
			player.animations.play('right');
		}
		
		if (cursors.up.isDown)
		{
			player.body.velocity.y = -150;   
			player.animations.play('up');
		}
		else if (cursors.down.isDown)
		{
			player.body.velocity.y = 150;   
			player.animations.play('down');
		}
		
		if (!cursors.up.isDown && !cursors.down.isDown &&
			!cursors.left.isDown && !cursors.right.isDown &&
			!this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
		   ) {
			player.animations.play('idle');
		}	
	},
	
	hit: function() {
		player.animations.play('hit');
		
		this.game.physics.overlap(
			player,
			enemy,
			this.kill,
			null,
			this
		);
	},
	
	kill: function() {
		sword = this.game.add.sprite(enemy.body.x - 16, enemy.body.y - 16, 'sword_sprite');
		
		sword.anchor.setTo(0, 0);  
		sword.animations.add('effect', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 60, false);
		sword.animations.play('effect');
		
		sfx_effect.play();
		sfx_background.pause();
		sfx_victory.play();
		
		enemy.kill();
		
		var game_over = this.game.add.text(
			this.game.world.centerX,
			this.game.world.centerY,
			'Victory\nCtrl+r to restart',
			{ fill : '#2e2', align: "center" }
		);
		
		game_over.anchor.setTo(0.5,0.5);
		
		this.game.time.events.remove(this.timer);
		
	}
};

// Add and start the 'main' state to start the game
game.state.add('main', main_state);  
game.state.start('main'); 