window.onload = function() {
    var game = new Phaser.Game(1200, 1200, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render : render });

    
    /*Current players turn
        1 = Player 1 is picking actions
        2 = Player 2 is picking actions
        3 = Remove all buttons and display text letting players know they can both look
        4 = Reveal actions, describe outcome in render log
        5 = Show outcome of police roll
    */

    

    var turn = 1;


    //Button Choice's for each player, to be compare (steal books and hold police are integers since they can be selected multiple times) 
    //NOTE: need to wipe these at some point
    var stealBooks1 = 0;
    var holdPolice1 = 0;
    var fleeToCar1 = false;
    var escape1 = false;
    var backstap1 = false;
    var guard1 = false;

    var stealBooks2 = 0;
    var holdPolice2 = 0;
    var fleeToCar2 = false;
    var escape2 = false;
    var backstap2 = false;
    var guard2 = false;

    var actionsChoosen = 0; //Variable for counting the number of actions the player has picked

    //Current players total books
    var player1Books = 0;
    var player2Books = 0;
    
    //Set if players have choosen "fleeing" no longer allow steal books and police modifer is in effect
    var player1Fleeing = false;
    var player2Fleeing = false;

    //Variables for if a player is dead
    var player1Dead = false;
    var player2Dead = false;

    var debug1 = false;
    var debug2 = false;

    var doOnce = false;

    var diceRoll = 0;
    
    // ---Set up code ---
    function preload () {
        
        
        game.load.image('stealBooksImage', 'assets/steal_books.png');

        
        game.load.image('holdPoliceImage', 'assets/hold_police.png');
        game.load.image('fleeToCarImage', 'assets/flee_to_car.png');
        game.load.image('escapeImage', 'assets/escape.png');
        game.load.image('backstabImage', 'assets/back_stab.png');
        game.load.image('guardImage', 'assets/guard.png');

        
        game.load.image('nextPlayerImage', 'assets/next_player.png');
        game.load.image('resolveActionImage', 'assets/resolve_action.png');
        game.load.image('policeTurnImage', 'assets/police_turn.png');

        game.load.audio('battleSound', 'assets/explosion.mp3');

        game.load.image('turn1EndImage', 'assets/turn1.png');
        game.load.image('turn2EndImage', 'assets/turn2.png');
        game.load.image('turn3EndImage', 'assets/turn3.png');
        game.load.image('turn4EndImage', 'assets/turn4.png');
        game.load.image('turn5EndImage', 'assets/turn5.png');
        
        
    }

    function create() {

        

        //Black background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';
        
        battleSound = game.add.audio('battleSound');

        //Button for advancing phases, in order pressing it advances player 1 to player 2, then player 2 to action resolution and results displayed
        //Then actions resolved to police outcome
        buttonNextPhase = game.add.button(300, 200, 'turn1EndImage', button, this, 2, 1, 0);

        //Buttons for picking actions, checks current player turn and then sets variables
        
        buttonStealBooks = game.add.button(150, 350, 'stealBooksImage', stealBooks, this, 2, 1, 0);
        buttonHoldPolice = game.add.button(300, 350, 'holdPoliceImage', holdPolice, this, 2, 1, 0);
        buttonFleeToCar = game.add.button(450, 350, 'fleeToCarImage', fleeToCar, this, 2, 1, 0);
        buttonEscape = game.add.button(600, 350, 'escapeImage', escape, this, 2, 1, 0);
        buttonBackstab = game.add.button(750, 350, 'backstabImage', backStab, this, 2, 1, 0);
        buttonGuard = game.add.button(900, 350, 'guardImage', guard, this, 2, 1, 0);
        
    }

    // ---Deletion/Safety code---
    function update(){

        //Core gameplay Loop, checks for when the button is pressed and tells players whos turn it is
        
        if(turn==1 && player1Dead==false){
            //Player 1 is picking actions, display the 6 buttons and ask them to pick 2

            //When displaying buttons, check if player is fleeing
            //  fleeing==false then display flee and steal buttons
            //  fleeing==true then display escape1
            //Always display
            //  hold Police, backStab and guard
            if(actionsChoosen<2){
                if(player1Fleeing==false){
                    
                    //Player can still choose to steal books and flee to car, but not escape
                    buttonStealBooks.input.enabled = true;
                    buttonFleeToCar.input.enabled = true;
                    buttonEscape.input.enabled = false;
                    
                }

                if(player1Fleeing==true){
                    buttonEscape.input.enabled = true;
                    buttonFleeToCar.input.enabled = false;
                    buttonStealBooks.input.enabled = false;
                    
                }
            }

            //If a player picks any action besides steal books/hold police disable the button and update the image to highlighted
            //If a player picks stealBooks/hold police don't disable the button and change the image to the half highlighted
            //If a player picks it a second time then fully highlight the image and disable the button

            //If actionsChoosen == 2 then disable all buttons except to make it player 2's turn
            if(actionsChoosen==2){
                buttonStealBooks.input.enabled = false;
                buttonHoldPolice.input.enabled = false;
                buttonFleeToCar.input.enabled = false;
                buttonEscape.input.enabled = false;
                buttonBackstab.input.enabled = false;
                buttonGuard.input.enabled = false;
                
            }

            if(player1Dead==true){turn = 2;}
        }

        if(turn==2 && player2Dead==false){
            //Player 1 is picking actions, display the 6 buttons and ask them to pick 2

            //When displaying buttons, check if player is fleeing
            //  fleeing==false then display flee and steal buttons
            //  fleeing==true then display escape1
            //Always display
            //  hold Police, backStab and guard
            if(actionsChoosen<2){
                if(player2Fleeing==false){
                    
                    //Player can still choose to steal books and flee to car, but not escape
                    buttonStealBooks.input.enabled = true;
                    buttonFleeToCar.input.enabled = true;
                    buttonEscape.input.enabled = false;
                    
                }

                if(player2Fleeing==true){
                    buttonEscape.input.enabled = true;
                    buttonFleeToCar.input.enabled = false;
                    buttonStealBooks.input.enabled = false;
                    
                }
            }

            //If a player picks any action besides steal books/hold police disable the button and update the image to highlighted
            //If a player picks stealBooks/hold police don't disable the button and change the image to the half highlighted
            //If a player picks it a second time then fully highlight the image and disable the button

            //If actionsChoosen == 2 then disable all buttons except to make it player 2's turn
            if(actionsChoosen==2){
                buttonStealBooks.input.enabled = false;
                buttonHoldPolice.input.enabled = false;
                buttonFleeToCar.input.enabled = false;
                buttonEscape.input.enabled = false;
                buttonBackstab.input.enabled = false;
                buttonGuard.input.enabled = false;  
            }

            if(player2Dead==true){turn = 3;}
        }
        
        if(turn==3){
            //Make a splash screen with just the "advance" button and telling player 2 to have player 1 come over and look for the reveal
            //This is a purely render based action so this if statement doesn't need to do anything, just a place holder for code down the line
            /*
            if(player1Dead && player2Dead){
                //Then go ahead and notice the game is over and set the variables to display that
            }
            */
        }
        
        
        if(turn==4){
            //Resolve actions, comparing what each player choose, and setting outcome globals so render knows what to show
            if(doOnce == false){
                //If either player choose stole books one or more times give them 2 books per time
                if(stealBooks1>0){player1Books = player1Books + 2*stealBooks1;}
                if(stealBooks2>0){player2Books = player2Books + 2*stealBooks2;}

                //We won't do anything with police actions here.  That will be in phase 5

                //If a player choose flee, set the flee variables
                if(fleeToCar1){player1Fleeing=true;}
                if(fleeToCar2){player2Fleeing=true;}

                //We won't do anything for escape here for now, code it in later

                //Backstab, if a player choose backstab, check to see if the other player choose guard otherwise set the death variable
                if(backstap1){
                    //First check if guard was choosen
                    if(guard2){
                        player1Dead = true;
                        player1Books = player1Books + player2Books;
                        player2Books = 0;
                    } else{
                        player2Dead = true;
                        player2Books = player2Books + player1Books;
                        player1Books = 0;
                    }
                }

                if(backstap2){
                    if(guard1){
                        player2Dead = true;
                        player1Books = player1Books + player2Books;
                        player2Books = 0;
                    } else{
                        player1Dead = true;
                        player2Books = player1Books + player2Books;
                        player1Books = 0;
                    }
                }
                doOnce = true
            }
        }
        
        
        if(turn==5 && doOnce==false){
            //Roll the police dice and add modifiers, set globals

            diceRoll = game.rnd.integerInRange(1,6);

            //If either player choose hold police one or more times add the number of times to the dice roll
            diceRoll = diceRoll + holdPolice1 + holdPolice2

            //If either player is fleeing reduce the roll
            if(player1Fleeing){diceRoll = diceRoll - 1;}
            if(player2Fleeing){diceRoll = diceRoll - 1;}

            if(diceRoll<3){
                player1Dead = true;
                player2Dead = true;
            }
            doOnce=true;

            stealBooks1 = 0;
            holdPolice1 = 0;
            fleeToCar1 = false;
            escape1 = false;
            backstap1 = false;
            guard1 = false;

            stealBooks2 = 0;
            holdPolice2 = 0;
            fleeToCar2 = false;
            escape2 = false;
            backstap2 = false;
            guard2 = false;
        }

        

    }

    function button(){
        
        //This is the overall function for when the player presses the main button.
        //Each time it is pressed it advances the player turn by 1
        if(turn==5){
            turn=1;
        } else{
            turn++;
        }

        if(turn==1){buttonNextPhase.loadTexture('turn1EndImage');}
        if(turn==2){buttonNextPhase.loadTexture('turn2EndImage');}
        if(turn==3){buttonNextPhase.loadTexture('turn3EndImage');}
        if(turn==4){buttonNextPhase.loadTexture('turn4EndImage');}
        if(turn==5){buttonNextPhase.loadTexture('turn5EndImage');}

        //This is also the wipe function, delete all buttons and depending on turn advancement wipe other variables

        //If it's a players turn renable all button
        
        if(turn<=2){
            actionsChoosen = 0;
            buttonStealBooks.input.enabled = true;
            buttonHoldPolice.input.enabled = true;
            buttonFleeToCar.input.enabled = true;
            buttonEscape.input.enabled = true;
            buttonBackstab.input.enabled = true;
            buttonGuard.input.enabled = true;
        }
        doOnce = false;  
    }

    //stealBook button function, adds 2 books to the total of which ever players turn it was when pressed
    function stealBooks(){
        
        if(turn==1){stealBooks1++;}
        if(turn==2){stealBooks2++;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    //Function for players holding the police
    function holdPolice(){
        
        if(turn==1){holdPolice1++;}
        if(turn==2){holdPolice2++;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    //Function for fleeing to car
    function fleeToCar(){
        
        if(turn==1){fleeToCar1=true; player1Fleeing=true;}
        if(turn==2){fleeToCar2=true; player2Fleeing=true;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    //Function for setting that a player tried to escape
    function escape(){
        
        if(turn==1){escape1=true;}
        if(turn==2){escape2=true;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    //Function for player choosing backstab
    function backStab(){
        
        if(turn==1){backstap1=true;}
        if(turn==2){backstap2=true;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    //Function for player choosing guard
    function guard(){
        
        if(turn==1){guard1=true;}
        if(turn==2){guard2=true;}
        actionsChoosen++; //Let the system know the player has choosen an action
        
    }

    function disableAllButtons(){
            buttonStealBooks.input.enabled = false;
            buttonHoldPolice.input.enabled = false;
            buttonFleeToCar.input.enabled = false;
            buttonEscape.input.enabled = false;
            buttonBackstab.input.enabled = false;
            buttonGuard.input.enabled = false;
            buttonNextPhase.input.enabled = false;
    }
    

    //Grid debugger display, all of this is commented out for now
    function render() {
        
        
        //Default Text describing all stats and basic game        
        game.debug.text('Welcome to the Great Book Heist, find a friend to play with first', 50, 20);
        game.debug.text('As a pair of book worms need to steal as many books as possible, the police will try and stop you', 50, 34);
        game.debug.text('Player 1 has '+player1Books+' books, player 2 has '+player2Books+' books', 50, 46);
        if(turn==1 && actionsChoosen<2){
            game.debug.text('Player 1: It is your turn, choose 2 actions.  Actions choosen: '+actionsChoosen, 50, 60);
        }
        if(turn==1 && actionsChoosen>=2){
            game.debug.text('Player 1: Your actions are choosen, click next turn and let player 2 pick actions', 50, 60);
        }
        if(turn==2 && actionsChoosen<2){
            game.debug.text('Player 2: It is your turn, choose 2 actions.  Actions choosen: '+actionsChoosen, 50, 60)
        }
        if(turn==2 && actionsChoosen>=2){
            game.debug.text('Player 2: Your actions are choosen, hit next and get player 1', 50, 60);
        }
        if(turn==3){
            game.debug.text('Both players: actions are locked, hit next and see the outcome', 50, 60);
        }
        if(turn==4){
            var p1Action1;
            var p1Action2;
            var p2Action1;
            var p2Action2;

            var Action1Set = false;

            if(stealBooks1>0){
                if(stealBooks1>1){
                    p1Action2 = 'Player 1 choose to steal more books';
                    p1Action1 = 'Player 1 choose to steal books';
                } else {
                    p1Action1 = 'Player 1 choose to steal books'; Action1Set = true;
                }
            }
            if(holdPolice1>0){
                if(holdPolice1>1){
                    p1Action1 = 'Player 1 spent time holding off the police';
                    p1Action2 = 'Player 1 spent more time holding off the police';
                } else{
                    if(Action1Set==false){
                        p1Action2 = 'Player 1 spent time holding off the police'; Action1Set = true;
                    } else{
                        p1Action2 = 'Player 1 spent time holding off the police';
                    }
                }
            }
            if(fleeToCar1){
                if(Action1Set){
                    p1Action2 = 'Player 1 fled the book store to the get away car!';
                } else{
                    p1Action1 = 'Player 1 fled the book store to the get away car!'; Action1Set = true;
                }
            }
            if(escape1){
                if(Action1Set){
                    p1Action2 = 'Player 1 started up the getaway car and took off!';
                } else{
                    p1Action1 = 'Player 1 started up the getaway car and took off!'; Action1Set = true;
                }
            }
            if(backstap1 && guard2 == false){
                if(Action1Set){
                    p1Action2 = 'Player 1 stabbed player 2 in the back! Player 2 is dead!';
                } else{
                    p1Action1 = 'Player 1 stabbed player 2 in the back! Player 2 is dead!'; Action1Set = true;
                } 
            }
            if(backstap1 && guard2 == true){
                if(Action1Set){
                    p1Action2 = 'Player 1 tried to stab player 2 in the back, but player 2 was on guard!  Player 1 is dead...';
                } else{
                    p1Action1 = 'Player 1 tried to stab player 2 in the back, but player 2 was on guard!  Player 1 is dead...'; Action1Set = true;
                } 
            }
            if(guard1){
                if(Action1Set){
                    p1Action2 = 'Player 1 is on guard... Watching player 2';
                } else{
                    p1Action1 = 'Player 1 is on guard... Watching player 2'; Action1Set = true;
                } 
            }
            Action1Set = false;
            //Determine text for player 2
            if(stealBooks2>0){
                if(stealBooks2>1){
                    p2Action2 = 'Player 2 choose to steal more books';
                    p2Action1 = 'Player 2 choose to steal books';
                } else {
                    p2Action1 = 'Player 2 choose to steal books'; Action1Set = true;
                }
            }
            if(holdPolice2>0){
                if(holdPolice2>1){
                    p2Action1 = 'Player 2 spent time holding off the police';
                    p2Action2 = 'Player 2 spent more time holding off the police';
                } else{
                    if(Action1Set==false){
                        p2Action2 = 'Player 2 spent time holding off the police'; Action1Set = true;
                    } else{
                        p2Action2 = 'Player 2 spent time holding off the police';
                    }
                }
            }
            if(fleeToCar2){
                if(Action1Set){
                    p2Action2 = 'Player 2 fled the book store to the get away car!';
                } else{
                    p2Action1 = 'Player 2 fled the book store to the get away car!'; Action1Set = true;
                }
            }
            if(escape2){
                if(Action1Set){
                    p2Action2 = 'Player 2 started up the getaway car and took off!';
                } else{
                    p2Action1 = 'Player 2 started up the getaway car and took off!'; Action1Set = true;
                }
            }
            if(backstap2 && guard1 == false){
                if(Action1Set){
                    p2Action2 = 'Player 2 stabbed player 1 in the back! Player 2 is dead!';
                } else{
                    p2Action1 = 'Player 2 stabbed player 1 in the back! Player 2 is dead!'; Action1Set = true;
                } 
            }
            if(backstap2 && guard1 == true){
                if(Action1Set){
                    p2Action2 = 'Player 2 tried to stab player 1 in the back, but player 1 was on guard!  Player 2 is dead...';
                } else{
                    p2Action1 = 'Player 2 tried to stab player 1 in the back, but player 1 was on guard!  Player 2 is dead...'; Action1Set = true;
                } 
            }
            if(guard2){
                if(Action1Set){
                    p2Action2 = 'Player 2 is on guard... Watching player 1';
                } else{
                    p2Action1 = 'Player 2 is on guard... Watching player 1'; Action1Set = true;
                } 
            }

            game.debug.text('Player 1 Action 1: '+p1Action1, 50, 60);
            game.debug.text('Player 1 Action 2: '+p1Action2, 50, 72);
            game.debug.text('Player 2 Action 1: '+p2Action1, 50, 84);
            game.debug.text('Player 2 Action 2: '+p2Action2, 50, 98);

        }

        if(turn==5){
            game.debug.text('Police turn', 50, 60);
            if(player1Dead && player2Dead){
                game.debug.text('You are caught!  The police got you!', 50, 72);
            } else{
                game.debug.text('You are safe, the police missed you, this time...', 50, 72);
            }
        }

        if(player1Dead && player2Dead){
            game.debug.text('The police have gotten both of you game over...', 50, 90);
            disableAllButtons();
        }
        if(escape1 && player2Fleeing){
            var totalBooks = player1Books + player2Books;
            game.debug.text('Both players have left in the get away car! Together you made off with '+totalBooks+' books', 50, 90);
            disableAllButtons();
        }
        if(escape2 && player1Fleeing){
            var totalBooks = player1Books + player2Books;
            game.debug.text('Both players have left in the get away car! Together you made off with '+totalBooks+' books', 50, 90);
            disableAllButtons();
        }
        if(escape1 && player2Fleeing == false){
            game.debug.text('Player 1 has left without player 2!  Game over, player 1 made off with '+player1Books+' books', 50, 90);
            disableAllButtons();
        }
        if(escape2 && player1Fleeing == false){
            game.debug.text('Player 2 has left without player 1!  Game over, player 2 made off with '+player2Books+' books', 50, 90);
            disableAllButtons();
        }
        if(escape1 && player2Dead){
            game.debug.text('Player 1 has left, with player 2 backstabed!  Game over, player 1 made off with '+player1Books+' books', 50, 90);
            disableAllButtons();
        }
        if(escape2 && player1Dead){
            game.debug.text('Player 2 has left, with player 1 backstabed!  Game over, player 2 made off with '+player1Books+' books', 50, 90);
            disableAllButtons();
        }

        /*
        game.debug.text('diceRoll='+diceRoll, 50, 102);
        game.debug.text('player1Fleeing='+player1Fleeing, 50, 112);
        game.debug.text('player2Fleeing='+player2Fleeing, 50, 124);
        game.debug.text('holdPolice1='+holdPolice1, 50, 136);
        game.debug.text('holdPolice2='+holdPolice2, 50, 148);
        */
        

        

        
        //Here is where most of the code goes for displaying messages to the player

        //Debugging, for intial start ups this just displays all current internal globals to see

        /*
        game.debug.text('turn ='+turn, 50,33);

        
        game.debug.text('Player 1 actions', 50, 46);
        game.debug.text('stealBooks1 = '+stealBooks1+', holdPolice1 = '+holdPolice1+', fleeToCar1 = '+fleeToCar1+', escape1 = '+escape1+', backstap1 = '+backstap1+' guard1 = '+guard1, 50, 58);
        
        
        game.debug.text('Player 2 actions', 50, 70);
        game.debug.text('stealBooks2 = '+stealBooks2+', holdPolice2 = '+holdPolice2+', fleeToCar2 = '+fleeToCar2+', escape2 = '+escape2+', backstap2 = '+backstap2+' guard2 = '+guard2, 50, 84);
        
        
        game.debug.text('Player states', 50, 96);
        game.debug.text('actionsChoosen = '+actionsChoosen+', player1Books = '+player1Books+', player2Books = '+player2Books+' player1Fleeing = '+player1Fleeing+', player2Fleeing = '+player2Fleeing, 50, 110);

        
        game.debug.text('players dead', 50, 122);
        game.debug.text('player1Dead = '+player1Dead+', player2Dead = '+player2Dead, 50, 136);

        game.debug.text('diceRoll='+diceRoll, 50, 150)
        */

        
    }
}