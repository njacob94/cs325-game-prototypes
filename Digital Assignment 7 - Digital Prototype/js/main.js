window.onload = function() {
    var game = new Phaser.Game(900, 900, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render : render });

    //Stats, the players main 4 values to keep track of
    var maxHealth = 3;
    var maxMana = 3;
    var dex = 3;
    var str = 3;

    //Current values for health/mana
    var curHealth = 3;
    var curMana = 3;

    //Variables for treasure and xp the player accumulates
    var treasure = 0;
    var xp = 0;

    //Variable for when the room the player encountered has treasure in it
    var emptyRoomTreasure = false;
    var treasureAmount = 0;

    //Variable for when the room the player encountered lets them rest
    var emptyRoomRest = false;

    //Variable for when the room the player encountered has a trap and variable for current trap strength
    var trapRoom = false;
    var trapLevel = 0; //is adjusted each time the player roles trap room

    //Variable for when the player encountered a monster and variable for current monster strength
    var monsterRoom = false;
    var monsterStr = 0; //Is adjusted each time the player roles monster room

    //Variable for when the player fights a boss, and variable for current boss strength
    var bossRoom = false;
    var bossStr = 0;

    //Variable to let the system know whenever the player has activated the new room function
    var playerPressButton = false;

    //Let the system know a dex test is needed
    var dexTestNeeded = false;

    //Variable to let the system know a dex test is passed or failed, can be 0 (fail), 1(passed), or 2(test not taken)
    var trapTestPassed = 2;

    //Let the system know a strength test is needed
    var strTestNeeded = false;

    //Lets the system know the outcome of a battle round
    // 0 = took damage, 1 = beat monster, 2 = no current battle ongoing
    var battleOutcome = 2;

    //Variable to let the battle function know the player currently has their strenght boostedStrength
    var boostedStrength = false;

    
    //Function that drains mana each round during combat, can be activated by certain bosses
    var manaDrain = false;

    //Variables to alert render what boss effect is employed

    var bossExtraStr = false;
    var bossLightingTest = false;
    var bossManaDrain = false;
    var bossFightNeeded = false;
    var bossBattleOutcome = 2; //Variable for the outcome of each round of a boss fight, 0=damage, 1=killed, 2 = not fighting

    var playerHasDied = false; //Variable for if the player died
    var endGame = 0; //Counter, when it reaches 52 the game is over
    

    // ---Set up code ---
    function preload () {
        game.load.image('battleImage', 'assets/battle.png');
        game.load.image('newRoomImage', 'assets/new_room.png');
        game.load.image('trapDodge', 'assets/trap_dodge.png');
        game.load.image('manaHeal', 'assets/mana_heal.png');
        game.load.image('manaStrength', 'assets/mana_strength.png');
        game.load.image('playerSprite', 'assets/player.png');
        game.load.image('playerDead', 'assets/player_death.png');
        game.load.image('playerBoss', 'assets/player_boss.png');
        game.load.image('playerMonster', 'assets/player_monster.png');
        game.load.image('playerTrap', 'assets/player_trap.png');
        game.load.audio('battleSound', 'assets/explosion.mp3');
    }

    function create() {

        //Black background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';
        
        battleSound = game.add.audio('battleSound');

        //Advance a room button and battle Button
        buttonNewRoom = game.add.button(150,350, 'newRoomImage', newRoom, this, 2, 1, 0);
        buttonBattle = game.add.button(300,350, 'battleImage', battle, this, 2,1,0);
        buttonTrap = game.add.button(450, 350, 'trapDodge', trap, this,2,1,0);
        buttonManaHeal = game.add.button(600, 350, 'manaHeal', manaHeal, this, 2, 1, 0);
        buttonManaStrength = game.add.button(750, 350, 'manaStrength', manaStrength, this, 2, 1, 0);

        playerState = game.add.sprite(450, 200, 'player');
    }

    // ---Deletion/Safety code---
    function update(){
        //Core gameplay Loop, checks for when the button is pressed to move into another room in the dungeon
        //Also can kick the gameplay over to the battle function

        if(curHealth<=0){ //Let the game know the player has been reduced to 0 health and end the game
            playerHasDied = true;
            playerState.loadTexture('playerDead');
        }

        if(xp>=4){ //Every time the player gets 4 xp go ahead and increase their stats by 1
            xp = xp-4;
            str++;
            dex++;
            maxHealth++;
            curHealth++;
            maxMana++;
            curMana++;
        }

        if(endGame==52 || playerHasDied == true){
            //Alert the system the game is over and to stop accepting button inputs
            buttonNewRoom.input.enabled = false;
            buttonBattle.input.enabled = false;
            buttonTrap.input.enabled = false;
        }
        //Check the current condition of the player and display the appropiate loadTexture
        if(playerHasDied){playerState.loadTexture('playerDead');}
        if(dexTestNeeded){playerState.loadTexture('playerTrap');}
        if(strTestNeeded){playerState.loadTexture('playerMonster');}
        if(bossFightNeeded){playerState.loadTexture('playerBoss');}
        if(bossFightNeeded == false && strTestNeeded == false && dexTestNeeded == false && playerHasDied == false){playerState.loadTexture('playerSprite');}
        
        
        if(playerPressButton){
            //The player has advanced a new room first find out what they encountered

            if(emptyRoomTreasure){
                treasure = treasure + treasureAmount;
                playerPressButton = false;
            }
            if(emptyRoomRest){
                if(curHealth<maxHealth){curHealth++;}
                if(curMana<maxMana){curMana++;}
            }
            if(trapRoom){
                dexTestNeeded = true; //Alert the system that a dex test is needed, don't accept other button inputs for now
            }
            if(monsterRoom){
                strTestNeeded = true; //Alert the system a strength test is needed, don't accept other button inputs
            }
            if(bossRoom){
                bossFightNeeded = true; //Alert the system a boss fight is needed
            }
            playerPressButton = false;
            endGame++;
        }
        
        
    }
    
    
    function newRoom(){
        //Function that advances one room

        //Check if the player currently needs to take a test, in which case don't do anything
        if(dexTestNeeded==false && strTestNeeded==false){ // && bossFightNeeded = false

            //First wipe the last room results
            emptyRoomRest = false;
            emptyRoomTreasure = false;
            trapRoom = false;
            monsterRoom = false;
            bossRoom = false;
            trapTestPassed = 2;
            battleOutcome = 2;
            
            bossBattleOutcome = 2;
            manaDrain = false;
            bossExtraStr = false;
            bossLightingTest = false;
            bossManaDrain = false;
            
            
            //Next generate a random number to compare to a series of rooms.
            var rndSeed = game.rnd.integerInRange(1,10);

            //Check condition, if the player is still level 3 or lower go ahead and don't let it role higher then 6 () (just call different rndSeed in range 1-6)
            
            //Empty Room treasure, generates a random amount of treasure and adds it to the players total
            if(rndSeed==1 || rndSeed==2){
                emptyRoomTreasure = true;
                treasureAmount = game.rnd.integerInRange(1,10); //Generate 1-10 treasure at random
            }
            
            
            //Empty Room rest, restore 1 mana and health
            if(rndSeed==3 || rndSeed==4){
                emptyRoomRest = true;
            }

            //trap, role against dex
            if(rndSeed==5){
                trapRoom = true;
                dexTestNeeded = true;
                trapLevel = game.rnd.integerInRange(1,6);
            }

            //Weak monster (strength under 7)
            if(rndSeed==6){
                monsterRoom = true;
                monsterStr = game.rnd.integerInRange(1,6);
            }

            //Dangerous trap, harder dex test
            if(rndSeed==7){
                trapRoom = true;
                dexTestNeeded = true;
                trapLevel = game.rnd.integerInRange(7,10);
            }

            //Strong monster (strenght >=7)
            if(rndSeed==8){
                monsterRoom = true;
                monsterStr = game.rnd.integerInRange(7,10); 
            }

            //Boss fight
            if(rndSeed==9 || rndSeed==10){
                bossRoom = true;
                bossStr = 8;
                roleForBossEffect();
            }
            
            playerPressButton = true; //Let the core update loop know the player advanced a room
        }
    }

    //Function that handles battles
    function battle(){
        if(strTestNeeded){ //Only do anything if the game is waiting for the player to take a strength test

            //First role the dice
            strRole = roleDice();
            finalResult = str + strRole;

            if(finalResult<monsterStr){
                //Player took damage don't let them exit the loop
                curHealth--;
                battleOutcome = 0;
            }
            if(finalResult>=monsterStr){
                //Player beat the monster, let them move to another room and give them an xp point
                strTestNeeded = false;
                xp++;
                battleOutcome = 1;
                battleSound.play();
            }
            
            if(boostedStrength){
                //If the player had boosted strength turn it off
                boostedStrength = false;
                str = str - 2;
            }
        }
        
        if(bossFightNeeded){//The player is fighting a boss, more complicated  battle rules
            strRole = roleDice();
            finalResult = str + strRole;

            if(finalResult<bossStr){
                //Player took damage don't let them exit the loop
                if(bossLightingTest){ //If the boss had lighting strike deal 2 damage instead of 1
                    curHealth = curHealth - 2;
                }
                if(bossLightingTest == false){curHealth--;}
                bossBattleOutcome = 0;
            }
            if(finalResult>=bossStr){
                //Player beat the boss, let them move to another room and give them 2 xp and 5 treasure
                bossFightNeeded = false;
                xp = xp+2;
                treasure = treasure + 5
                bossBattleOutcome = 1;
                battleSound.play();
            }
            if(boostedStrength){
                //If the player had boosted strength turn it off
                boostedStrength = false;
                str = str - 2;
            }
            if(manaDrain){
                //If the boss had mana drain running remove one mana
                if(curMana>0){
                    curMana--;
                }
            }
        }
        
    }

    //Function that handles trap tests
    function trap(){
        if(dexTestNeeded){ //Only run if a dex test is needed
            //First we role the dice and add dex
            dexRole = roleDice();
            finalResult = dex + dexRole;
            if(finalResult>=trapLevel){
                //Player passed the test, let the system know
                trapTestPassed = 1;
            }
            if(finalResult<trapLevel){
                //Player failed test, let system know and reduce health by 1
                curHealth--;
                trapTestPassed = 0;
            }
            dexTestNeeded = false; //Alert the system the player has done their test, they can accept other inputs
        }
    }

    function manaHeal(){
        //Function that expends mana to restore health
        if(curMana>=2){
            curMana = curMana - 2;
            curHealth = curHealth + 2;
            if(curHealth>maxHealth){curHealth = maxHealth;}//Don't let the player overheal with this
        }
    }

    function manaStrength(){
        //Function that expends mana to raise strength for a round
        if(curMana>=2){
            curMana = curMana - 2;
            str = str + 2;
            boostedStrength = true;
        }
    }
    

    
    function roleForBossEffect(){
        //Function that roles to see what random effect the boss has

        var rndSeed = game.rnd.integerInRange(1,3);
        if(rndSeed==1){bossStr = bossStr + 3; bossExtraStr = true;} //Increase boss strength
        if(rndSeed==2){bossLightingTest = true;} //lighting strike
        if(rndSeed==3){manaDrain = true; bossManaDrain = true;} //Lighting strikes
        //if(rndSeed=4){}
        //if(rndSeed=5){}
        //if(rndSeed=6){}
    }
    
    
    
    //Functon for random number generation
    function roleDice(){return game.rnd.integerInRange(1,6);}


    //Grid debugger display, all of this is commented out for now
    function render() {

        //Default Text describing all stats and basic game        
        game.debug.text('Welcome to Dungen Text Adventure: explore the dungeon, get xp and treasure.', 50, 20);
        game.debug.text('Press the button to advance explore a room', 50, 34);
        game.debug.text('Your current stats: Health='+curHealth+", Mana="+curMana+", Strength="+str+", Dexterity="+dex, 50, 48);
        game.debug.text('You have '+treasure+' treasure so far', 50, 60);
        game.debug.text('You have '+xp+' xp so far.  Every 4 xp your stats are all increased by 1', 50, 72)

        //Text showing current room they are in
        var curRoom = "outside dungeon"; //Default text for when the player hasn't pressed a button yet
        if(emptyRoomTreasure){curRoom = "A room filled with Treasure!  You sweep it up and add it to your stash";}
        if(emptyRoomRest){curRoom = "An empty and barron room, you take some time to rest and recover health and mana";}
        if(trapRoom){curRoom = "It's a Trap! Trap level is: "+trapLevel;}
        if(monsterRoom){curRoom = "A room with a monster! Monster strength is: "+monsterStr;}
        if(bossRoom){curRoom = "A room with a boss! Boss strength is: "+bossStr;}
        game.debug.text('Current Room is: '+curRoom, 50, 150);

        //If the player encounters a trap display the results of trying to dodge
        if(dexTestNeeded){
            game.debug.text('Press the button to take the dex test to try and dodge the trap', 50, 163);
        }
        
        if(trapTestPassed==1){
            game.debug.text('You sucesfully pass the trap', 50, 163);
        }
        
        if(trapTestPassed==0){
            game.debug.text('You trip and take 1 damage from the trap', 50, 163);
        }
        
        //If the player winds up locked in battle
        if(strTestNeeded){
            game.debug.text('Press the battle button to try and beat the monster', 50, 163);
        }
        if(battleOutcome == 1){
            game.debug.text('You managed to defeat the monster! Gain 1 xp', 50, 176);
        }
        if(battleOutcome == 0){
            game.debug.text('Ouch! You get hit by the monster and lose 1 health, try battling again.', 50, 176);
        }

        

        //If the player is fighting a boss
        if(bossFightNeeded){
            game.debug.text('Press the battle button to try and beat the boss!', 50, 163)
        }
        if(bossExtraStr){
            game.debug.text('This boss is extra strong!', 50, 176);
        }
        if(bossLightingTest){
            game.debug.text('This boss is extra fast! He can hit you twice each time he hits you', 50, 176);
        }
        
        if(bossManaDrain){
            game.debug.text('This boss has an aura that saps your mana!  You will love mana each round', 50, 176);
        }
        if(bossBattleOutcome == 0){
            game.debug.text('Ouch! You get hit by the boss and take damage', 50, 189);
        }
        
        if(bossBattleOutcome == 1){
            game.debug.text('You manage to defeat the boss! You earn extra xp and some treasure', 50, 189);
        }

        if(playerHasDied){
            game.debug.text('You have been reduced to 0 health, game over', 50, 130);
        }

        if(endGame==52){
            game.debug.text('Congrats! You finished the dungeon, your final treasure count is:'+treasure);
        }
        



    }
}
