window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

    //---Inital globals---

    var cursors;

    var hand;
    var lung;
    var wrongLung;
    var exit;

    var points = 100;
    var timer;

    var hasOrgan = false;
    var organCounter = 0;

    var cut;

    //---Load assets---
    function preload () {
        game.load.image('knife', 'assets/knife.png');
        game.load.image('lung', 'assets/lung.png');
		game.load.image('lungHand', 'assets/lung_hand.png');
        game.load.image('eye', 'assets/eye.png');
        game.load.image('eyeHand', 'assets/eye_hand.png');
        game.load.image('kidney', 'assets/kidney.png');
        game.load.image('kidneyHand', 'assets/kidney_hand.png');
        game.load.image('exit', 'assets/exit.png');
        game.load.image('bodySquare', 'assets/body_square.png');
        game.load.image('bodyWide', 'assets/body_wide.png');
        game.load.image('bodyTall', 'assets/body_tall.png');
        game.load.audio('cut', 'assets/cut.wav');
    }

    //---Set up---
    function create() {

        //White background
        game.stage.backgroundColor = 'rgb(255, 255, 255)';
        //Sound
        cut = game.add.audio('cut');

        //Code to run a timer, when the timer counts down the game is over
        timer = game.time.create(false);
        timer.loop(60000)
        timer.start();

        //--Fixed Placements--

        //Create the players hand for them to move around, start with the knife for now
        hand = game.add.sprite(game.world.centerX, game.world.centerY, 'knife');
        hand.x = 550;
        hand.y = 600;
        game.physics.enable(hand, Phaser.Physics.ARCADE);
        hand.body.collideWorldBounds = true;
        hand.body.bounce.setTo(1,1);
         //  Enables input for players hand
        hand.inputEnabled = true;
        cursors = game.input.keyboard.createCursorKeys();

        //Exit zone, if the lung is moved here you get points and switch back to knife
        exit = game.add.sprite(game.world.centerX, game.world.centerY, 'exit');
        exit.x = 550;
        exit.y = 750;
        game.physics.enable(exit, Phaser.Physics.ARCADE);
        exit.body.collideWorldBounds = true;
        exit.body.immovable = true;

        //--Random placements--

        //The lung the player is trying to reach
        lung = game.add.sprite(game.world.centerX, game.world.centerY, 'lung');
        lung.x = game.rnd.integerInRange(200, 400);
        lung.y = game.rnd.integerInRange(50, 200);
        game.physics.enable(lung, Phaser.Physics.ARCADE);
        lung.body.collideWorldBounds = true;
        lung.body.immovable = true;

        //The kidney the player is trying to reach
        kidney = game.add.sprite(game.world.centerX, game.world.centerY, 'kidney');
        kidney.x = game.rnd.integerInRange(500, 700);
        kidney.y = game.rnd.integerInRange(50, 200);
        game.physics.enable(kidney, Phaser.Physics.ARCADE);
        kidney.body.collideWorldBounds = true;
        kidney.body.immovable = true;

        //The eye the player is trying to reach
        eye = game.add.sprite(game.world.centerX, game.world.centerY, 'eye');
        eye.x = game.rnd.integerInRange(50, 150);
        eye.y = game.rnd.integerInRange(50, 200);
        game.physics.enable(eye, Phaser.Physics.ARCADE);
        eye.body.collideWorldBounds = true;
        eye.body.immovable = true;

        //Loading body tiles, which will lose points if hit
        bodySquare = game.add.sprite(game.world.centerX, game.world.centerY, 'bodySquare');
        bodySquare.x = game.rnd.integerInRange(0, 500);
        bodySquare.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodySquare, Phaser.Physics.ARCADE);
        bodySquare.body.collideWorldBounds = true;
        bodySquare.body.immovable = true;

        bodySquare2 = game.add.sprite(game.world.centerX, game.world.centerY, 'bodySquare');
        bodySquare2.x = game.rnd.integerInRange(0, 500);
        bodySquare2.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodySquare2, Phaser.Physics.ARCADE);
        bodySquare2.body.collideWorldBounds = true;
        bodySquare2.body.immovable = true;

        bodyWide = game.add.sprite(game.world.centerX, game.world.centerY, 'bodyWide');
        bodyWide.x = game.rnd.integerInRange(0, 500);
        bodyWide.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodyWide, Phaser.Physics.ARCADE);
        bodyWide.body.collideWorldBounds = true;
        bodyWide.body.immovable = true;

        bodyWide2 = game.add.sprite(game.world.centerX, game.world.centerY, 'bodyWide');
        bodyWide2.x = game.rnd.integerInRange(0, 500);
        bodyWide2.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodyWide2, Phaser.Physics.ARCADE);
        bodyWide2.body.collideWorldBounds = true;
        bodyWide2.body.immovable = true;

        bodyTall = game.add.sprite(game.world.centerX, game.world.centerY, 'bodyTall');
        bodyTall.x = game.rnd.integerInRange(0, 500);
        bodyTall.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodyTall, Phaser.Physics.ARCADE);
        bodyTall.body.collideWorldBounds = true;
        bodyTall.body.immovable = true;

        bodyTall2 = game.add.sprite(game.world.centerX, game.world.centerY, 'bodyTall');
        bodyTall2.x = game.rnd.integerInRange(0, 500);
        bodyTall2.y = game.rnd.integerInRange(200, 500);
        game.physics.enable(bodyTall2, Phaser.Physics.ARCADE);
        bodyTall2.body.collideWorldBounds = true;
        bodyTall2.body.immovable = true;

        bodyTall3 = game.add.sprite(game.world.centerX, game.world.centerY, 'bodyTall');
        bodyTall3.x = game.rnd.integerInRange(0, 500);
        bodyTall3.y = game.rnd.integerInRange(200, 300);
        game.physics.enable(bodyTall3, Phaser.Physics.ARCADE);
        bodyTall3.body.collideWorldBounds = true;
        bodyTall3.body.immovable = true;
        
        bodySquare3 = game.add.sprite(game.world.centerX, game.world.centerY, 'bodySquare');
        bodySquare3.x = game.rnd.integerInRange(0, 500);
        bodySquare3.y = game.rnd.integerInRange(400, 500);
        game.physics.enable(bodySquare3, Phaser.Physics.ARCADE);
        bodySquare3.body.collideWorldBounds = true;
        bodySquare3.body.immovable = true;
    }

    //---On going updates---
    function update(){
        //Hand Cursor Movement
		hand.body.velocity.x = 0;
		hand.body.velocity.y = 0;
		if(cursors.up.isDown){hand.body.velocity.y = -250 + game.rnd.integerInRange(-100, 100);}
    	if(cursors.down.isDown){hand.body.velocity.y = 250 + game.rnd.integerInRange(-100, 100);}
    	if(cursors.left.isDown){hand.body.velocity.x = -250 + game.rnd.integerInRange(-100, 100);}
    	if(cursors.right.isDown){hand.body.velocity.x = 250 + game.rnd.integerInRange(-100, 100);}

		//Turn on collision detection for organs and cursor
        game.physics.arcade.collide(lung, hand, lungCollide, null, this);
        game.physics.arcade.collide(kidney, hand, kidneyCollide, null, this);
        game.physics.arcade.collide(eye, hand, eyeCollide, null, this);
        game.physics.arcade.collide(bodySquare, hand, badCollide, null, this);
        game.physics.arcade.collide(exit, hand, exitCollide, null, this);
        
        //Turn on collision detection for Body blocks
        game.physics.arcade.collide(bodyWide, hand, badCollide, null, this);
        game.physics.arcade.collide(bodyTall, hand, badCollide, null, this);
        game.physics.arcade.collide(bodySquare2, hand, badCollide, null, this);
        game.physics.arcade.collide(bodyWide2, hand, badCollide, null, this);
        game.physics.arcade.collide(bodyTall2, hand, badCollide, null, this);
        game.physics.arcade.collide(bodyTall3, hand, badCollide, null, this);
        game.physics.arcade.collide(bodySquare3, hand, badCollide, null, this);
    }

    //Collide with Lung function
    function lungCollide(){
        if(hasOrgan == false){ //Check the player doesn't already have an organ
            cut.play(); //Play cutting sound
            points = points + 10; //Give player points
            lung.destroy(); //Delete lung sprite
            hand.loadTexture('lungHand'); //Change the players hand to holding the lung
            hasOrgan = true; //Change so player can't get another organ
        }
    }

    //Collide with kidney function
    function kidneyCollide(){
        if(hasOrgan == false){
            cut.play()
            points = points + 10;
            kidney.destroy();
            hand.loadTexture('kidneyHand');
            hasOrgan = true;
        }
    }
    
    //Collide with eye function
    function eyeCollide(){
        if(hasOrgan == false){
            cut.play()
            points = points + 10;
            eye.destroy();
            hand.loadTexture('eyeHand');
            hasOrgan = true;
        }
    }

    //Collide with exit function
    function exitCollide(){
        if(hasOrgan == true){ //Check player has an organ before doing anything
            hand.loadTexture('knife'); //Switch players hand back to knife
            points = points + 100 + timer.duration.toFixed(0)/1000; //Give the player a flat bonus of 100 and Add how ever much time is left as points
            hasOrgan = false; //Switch player to not having an organ
            organCounter = organCounter + 1; //Update the counter by 1
            if(organCounter == 3){timer.stop();} //if all 3 organs are collected stop the timer
        }
    }

    //Collide with the wrong thing subtract points
    function badCollide(){points = points - 10;}

    //Function to display remaining time and current points
    function render() {
        game.debug.text('Time Left: ' + timer.duration.toFixed(0)/1000, 50, 50);
		game.debug.text('Points: '+points, 62, 62);
        game.debug.text('Use arrow keys to move the knife to each organ then to the operating table', 10, 10);
        game.debug.text('You get more points the faster you get each organ', 22, 22);
        game.debug.text('You lose points if you hit the sensitive black tissue', 35, 35)
    }
}
