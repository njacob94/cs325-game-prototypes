window.onload = function() {

    var game = new Phaser.Game(800, 800, Phaser.AUTO, 'game', { preload: preload, create: create, render : render });

    //Inital globals
    var image;
    var scared;
    var text;
    var points = 0;
    var timer;
    var bang;


    //Preload cowboy image we are using and the image of the rock
    function preload () {
        game.load.image('rock', 'assets/rock.png');
        game.load.image('cowboy', 'assets/cowboy.png');
        game.load.audio('bang', 'assets/bang.mp3');
    }

    function create() {

        //Load rock images for our sprite to click on
        game.stage.backgroundColor = 'rgb(0, 0, 0)';
        image = game.add.sprite(game.world.centerX, game.world.centerY, 'rock');
        image.anchor.set(0.5);

        //Load bang audio for rock
        bang = game.add.audio('bang');

        //load our cowboy image and set him in the upper left
        scared = game.add.sprite(game.world.centerX, game.world.centerY, 'cowboy');
        scared.anchor.set(0.5);
        scared.x = 200;
        scared.y = 200;

        //Enable Physics for our object so it will bounce around and be harder to click
        game.physics.arcade.enable(image);
        game.physics.arcade.gravity.y = 400;
        image.body.velocity.set(200, 200);
        image.body.bounce.set(1, 1);
        image.body.collideWorldBounds = true;

        //Code to run a timer, when the timer counts down the game is over and the rock stops moving
        timer = game.time.create(false);
        timer.loop(30000)
        timer.start();

         //  Enables input for our object
        image.inputEnabled = true;
        
        //When you click the object activate the listener function.  Update Players current score
        text = game.add.text(250, 40, 'You have: '+points+ ' points', { fill: '#ffffff' });
        image.events.onInputDown.add(listener, this);        

    }

    //This function gives the player 10 points everytime they click the image then randomized the velocity its set too
    function listener () {
        points = points + 10;
        text.text = 'You have: '+points+ ' points';
        //Play a bang sound for audio feedback
        bang.play();
        //Randomize velocity in range of 500-700 generally makes the rock fly quickly
        image.body.velocity.set(game.rnd.integerInRange(500,700),game.rnd.integerInRange(500,700));
    }

    //Show timer in the upper left
    function render() {
        game.debug.text('Time Left: ' + timer.duration.toFixed(0)/1000, 32, 32);
    }
}
