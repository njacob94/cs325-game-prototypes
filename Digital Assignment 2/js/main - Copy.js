window.onload = function() {

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

    //Inital globals

    var cursors;
    
    //Sprite Objects
    //Add new sprite for a zone where the player moves their hand to switch roles
    //Add new sprite for a red line to be deleted each time the organ isCut state changes
    
    //Hand needs 3 states empty/knife/organ
    //var hand;
    //var handIsEmpty = false;
    //var handIsKnife = true;
    //var handIsOrgan = false;
        
    //var body;

    //var heart;
    //var heartIsCut = false;
    var lung;
    //var lungIsCut = false;
    //var eye;
    //var lungIsCut = false;

    //Total points ,start at 1000 and subtract points each time they make a mistake
    var points = 1000;

    //Timer
    var timer;

    //Squish audio and cut audio
    //var cut;
    //var squish;


    //Preload images of the organs, body, knife and glove

    //Note: Body may have to multiple images placed around the map since otherwise it will make collision tricky.
    //Maybe make a plain black block and then we'll place multiple copies of it
    //Make sure to shape the body so that the act of switching between the knife and hand requires different techniques to reach
    function preload () {
        //game.load.image('hand', 'assets/hand.png');
        game.load.image('knife', 'assets/knife.png');
        //game.load.image('heart', 'assets/heart.png');
        game.load.image('lung', 'assets/lung.png');
        //game.load.image('eye', 'assets/eye.png');
        //game.load.image('Body', 'assets/body.png');

        //Make a sound here for cutting and one for squishing
        game.load.audio('cut', 'assets/cut.mp3');
        //game.load.audio('squish', 'assets/squish.mp3');
    }

    function create() {

        //Load sprites for everything

        //White background
        game.stage.backgroundColor = 'rgb(255, 255, 255)';

        //Creating hand, using the knife image for now, enable physics and collisions
        hand = game.add.sprite(game.world.centerX, game.world.centerY, 'knife');
        hand.x = 500;
        hand.y = 500;
        game.physics.enable(hand, Phaser.Physics.ARCADE);
        hand.body.collideWorldBounds = true;
        hand.body.bounce.setTo(1,1);

        //heart = game.add.sprite(game.world.centerX, game.world.centerY, 'heart');
        //heart.anchor.set(0.5);

        lung = game.add.sprite(game.world.centerX, game.world.centerY, 'lung');
        lung.x = 200;
        lung.y = 200;
        game.physics.enable(lung, Phaser.Physics.ARCADE);
        lung.body.collideWorldBounds = true;
        lung.body.immovable = true;
        hand.body.checkCollision.up = true;
        hand.body.checkCollision.down = true;

        //eye = game.add.sprite(game.world.centerX, game.world.centerY, 'eye');
        //eye.anchor.set(0.5);
        //body = game.add.sprite(game.world.centerX, game.world.centerY, 'body');
        //body.anchor.set(0.5);

        //Load cuting and squish audio
        cut = game.add.audio('cut');
        //squish = game.add.audio('squish');

        //Enable Physics for our objects
        //game.physics.arcade.enable(image);
        //game.physics.arcade.gravity.y = 400;
        //image.body.velocity.set(200, 200);
        //image.body.bounce.set(1, 1);
        //image.body.collideWorldBounds = true;

        //Code to run a timer, when the timer counts down the game is over
        timer = game.time.create(false);
        timer.loop(60000)
        timer.start();


        //Here is where we do input.  The only player input is the  cursor keys allowing the player to guide their hand around

         //  Enables input for our object
        hand.inputEnabled = true;
        cursors = game.input.keyboard.createCursorKeys();
        

        //The gameplay elements

        //Each organ needs a variable for whether it is cut    

    }

    function update(){
        //Hand Cursor Movement
        if(cursors.up.isDown){hand.y -= 4;}
        if(cursors.down.isDown){hand.y += 4;}
        if(cursors.left.isDown){hand.x -= 4;}
        if(cursors.right.isDown){hand.x +=4;}

        game.physics.arcade.collide(lung, hand);


    }

    //This function should react when the player hand connects with the walls of the body always a negative outcome.  
    //function bodyListener () {
        //Play audio for contact here, should be an if statement depending on the item used
        //if(handIsKnife == true){
            //cut.play();
            //points = points - 50;
        //}
        //if(handIsEmpty == true || handIsOrgan == true){
        //    squish.play();
        //    points = points - 10;
        //}
        //bang.play();
        //penalize the players total points
    //}

    //This function will listen for when the player connects with each kind of organ
    //function organListen(){
        //Play sound
        //if it was the hand switch the image to that of the organ and let the player start controlling it

        //If hand is knife then set isCut state for organ
        //If hand is empty and organ isCut then switch player hand to organ
        //Otherwise no change in state

        //Return hand state
    //}

    //This function should detect if the player moves their hand into the switch zone then update
    //function switchHandListen(){
        //2 possabilties
        
        //If hand is empty switch to knife
        //If hand is knife switch to empty
        //If hand is organ switch to knife/give points

        //if(handIsEmpty == true){
            //handIsEmpty = false;
            //handIsKnife = true;
        //}
        //if(handIsKnife == true){
            //handIsKnife = false;
            //handIsEmpty = true;
        //}
        //if(handIsOrgan == true){
            //handIsKnife = true;
            //handIsOrgan = false;
        //}
        //Return current hand state
    //}

    //Show timer in the upper left
    function render() {
        game.debug.text('Time Left: ' + timer.duration.toFixed(0)/1000, 32, 32);
    }
}
