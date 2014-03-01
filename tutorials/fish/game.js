var fishSprite, coinsGroup;

var game = new Phaser.Game(
    800,
    600,
    Phaser.AUTO,
    '',
    { preload: preload, create: create, update: update }
);

function preload() {
    game.load.image('fish', 'assets/fish.png');
    game.load.image('star', 'assets/star.png');
}

function create() {
	// da fish
	fishSprite = game.add.sprite(game.world.centerX, 0, 'fish');
	fishSprite.width = 80;
	fishSprite.height = 80;
	fishSprite.scale.x = 0.16;
	fishSprite.body.acceleration.y = 200;
	fishSprite.body.collideWorldBounds = true;
	fishSprite.body.drag.x = 200;
	fishSprite.anchor.setTo(0.5, 0.5);
	
	// da coins
	coinsGroup = game.add.group();
	coinsGroup.create(250,400, 'star');
	coinsGroup.create(100,400, 'star');
	coinsGroup.create(400,400, 'star');
}

function update() {
	// da input
	if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
		fishSprite.body.velocity.x = -50;
		fishSprite.scale.x = 0.16;
	} else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
		fishSprite.body.velocity.x = 50;
		fishSprite.scale.x = -0.16;
	}
	
	if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		fishSprite.body.velocity.y = -100;	
	}
	
	// collision
	game.physics.collide(fishSprite, coinsGroup,
						 fishHitCoint, null, this);
}

function fishHitCoint(fish, coin) {
	coin.destroy();
}
