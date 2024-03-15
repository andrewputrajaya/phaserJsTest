var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var player;
var cursors;
var jumpButton;
var shootButton;

var enemies = [];

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('bullet', 'assets/bullet.png');
    this.load.image('arrow_left', 'assets/arrow_left.png');
    this.load.image('arrow_right', 'assets/arrow_right.png');
    this.load.image('arrow_up', 'assets/arrow_up.png');
    this.load.image('shoot_button', 'assets/shoot_button.png');
    this.load.spritesheet('enemy-1', 'assets/enemy-1.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, game.config.height - 75, 'ground').setScale(1).refreshBody();

    player = this.physics.add.sprite(100, 300, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.physics.add.collider(player, platforms);

    enemies.push(this.physics.add.sprite(300, 300, 'enemy-1').setScale(1).refreshBody());
    enemies[0].setBounce(1, 1).setCollideWorldBounds(true).setVelocityY(50).setVelocityX(0).setDepth(1);
    this.anims.create({
        key: 'enemy-1-jump',
        frames: this.anims.generateFrameNumbers('enemy-1', { frames: [1] }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'enemy-1-ground',
        frames: this.anims.generateFrameNumbers('enemy-1', { frames: [0] }),
        frameRate: 10,
        repeat: -1
    });
    this.physics.add.collider(enemies, platforms, function(enemy) {
        enemy.anims.play('enemy-1-ground', true);
    }, function(enemy) {
        enemy.anims.play('enemy-1-jump', true);
    });


    // Create virtual arrow keys
    var arrowLeft = this.add.image(100, 560, 'arrow_left');
    var arrowRight = this.add.image(200, 560, 'arrow_right');
    var arrowUp = this.add.image(150, 490, 'arrow_up');

    // Scale and set interactive for arrow keys
    [arrowLeft, arrowRight, arrowUp].forEach(arrow => {
        arrow.setInteractive();
    });

    // Virtual controls for arrow keys
    arrowLeft.on('pointerdown', function() {
        cursors.left.isDown = true;
    });
    arrowLeft.on('pointerup', function() {
        cursors.left.isDown = false;
    });
    arrowRight.on('pointerdown', function() {
        cursors.right.isDown = true;
    });
    arrowRight.on('pointerup', function() {
        cursors.right.isDown = false;
    });
    arrowUp.on('pointerdown', function() {
        if (player.body.touching.down) {
            player.setVelocityY(-330);
        }
    });

    // Create virtual shoot button
    var shootButton = this.add.image(700, 525, 'shoot_button');

    // Set interactive for shoot button
    shootButton.setInteractive();

    // Virtual controls for shoot button
    shootButton.on('pointerdown', function() {
        shootBullet(this.scene);
    });

    cursors = this.input.keyboard.createCursorKeys();

    // Event listener for space bar to shoot bullets
    this.input.keyboard.on('keydown-SPACE', function() {
        shootBullet(this.scene);
    });
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
        player.flipX = true; // Ensure the player is facing left
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
        player.flipX = false; // Ensure the player is facing right
    }
    else {
        // If the left or right button is not pressed, play the turn animation and maintain the facing direction
        player.setVelocityX(0);
        player.anims.play('turn', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function shootBullet(scene) {
    var bulletSpeed = 400;
    var bullet = scene.physics.add.image(player.x, player.y, 'bullet');

    // Set bullet velocity based on player direction
    if (cursors.left.isDown) {
        bullet.setVelocityX(-bulletSpeed);
    } else if (cursors.right.isDown) {
        bullet.setVelocityX(bulletSpeed);
    } else {
        // If neither left nor right is pressed, shoot towards the direction the player is facing
        if (player.flipX) {
            bullet.setVelocityX(-bulletSpeed); // Shoot left if player is facing left
        } else {
            bullet.setVelocityX(bulletSpeed); // Shoot right if player is facing right
        }
    }

    scene.physics.add.collider(bullet, platforms, function() {
        bullet.destroy();
    });

    scene.physics.add.collider(bullet, enemies, function(bullet, enemy) {
        bullet.destroy();
        enemy.destroy();
    });
}
