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

    var optionToLeave = false; //Variable for when the player is allowed to leave early

    var playerLevel = 0; //Internally keeps track of player level, when the player has gained 2 levels go ahead and begin throwing harder challenges

    //Merchant Variables
    var merchantAvailable = false;
    var hasSword = false;
    var hasArmor = false;
    var armorBlockedDamage = false;
    var hasPotion = false;

    var debugCounter = 0; //Internal counter when debugging the newRoom loop
    

    // ---Set up code ---
    function preload () {
        game.load.image('battleImage', 'assets/battle.png');
        game.load.image('newRoomImage', 'assets/new_room.png');
        game.load.image('trapDodge', 'assets/trap_dodge.png');
        game.load.image('manaHeal', 'assets/mana_heal.png');
        game.load.image('manaStrength', 'assets/mana_strength.png');
        game.load.image('playerSprite', 'assets/player.png');
        game.load.image('playerDead', 'assets/player_dead.png');
        game.load.image('playerBoss', 'assets/player_boss.png');
        game.load.image('playerMonster', 'assets/player_monster.png');
        game.load.image('playerTrap', 'assets/player_trap.png');
        game.load.image('optionToLeaveImage', 'assets/option_to_leave.png');
        game.load.audio('battleSound', 'assets/explosion.mp3');

        game.load.image('merchantImage', 'assets/merchant.png');
        game.load.image('swordImage', 'assets/sword.png');
        game.load.image('swordBuyImage', 'assets/sword_buy.png');
        game.load.image('armorImage', 'assets/armor.png');
        game.load.image('armorBuyImage', 'assets/armor_buy.png');
        game.load.image('potionImage', 'assets/potion.png');
        game.load.image('potionBuyImage', 'assets/potion_buy.png');
    }

    function create() {

        //Black background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';
        
        battleSound = game.add.audio('battleSound');
        buttonAdvance = game.add.button(150,350, 'newRoomImage', button, this, 2, 1, 0);
        buttonManaHeal = game.add.button(450, 350, 'manaHeal', manaHeal, this, 2, 1, 0);
        buttonManaStrength = game.add.button(600, 350, 'manaStrength', manaStrength, this, 2, 1, 0);

        playerState = game.add.sprite(300, 350, 'player');
    }

    // ---Deletion/Safety code---
    function update(){
        //Core gameplay Loop, checks for when the button is pressed to move into another room in the dungeon
        //Also can kick the gameplay over to the battle function

        if(curHealth<=0){ //Let the game know the player has been reduced to 0 health and end the game
            playerHasDied = true;
        }

        if(xp>=4 && playerLevel<3){ //Every time the player gets 4 xp go ahead and increase their stats by 1 
            xp = xp-4;
            str++;
            dex++;
            maxHealth++;
            curHealth++;
            maxMana++;
            curMana++;
            playerLevel++;
        }

        if(endGame==52 || playerHasDied == true){
            //Alert the system the game is over and to stop accepting button inputs
            buttonAdvance.input.enabled = false;
            buttonManaHeal.input.enabled = false;
            buttonManaStrength.input.enabled = false;
            if(optionToLeave){buttonOptionToLeave.input.enabled = false;}
            if(playerHasDied){playerState.loadTexture('playerDead');}
        }

        //Check if the player has bought anything from the merchant and display the appropiate sprite

        //Check the current condition of the player and display the appropiate loadTexture
        if(playerHasDied){playerState.loadTexture('playerDead');}
        if(dexTestNeeded){
            playerState.loadTexture('playerTrap');
        }
        if(strTestNeeded){playerState.loadTexture('playerMonster');}
        if(bossFightNeeded){playerState.loadTexture('playerBoss');}
        if(bossFightNeeded == false && strTestNeeded == false && dexTestNeeded == false && playerHasDied == false){
            playerState.loadTexture('playerSprite');
            buttonAdvance.loadTexture('newRoomImage');
        }
        
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
            if(optionToLeave){
                //The player has the chance to leave the dungeon early
                buttonOptionToLeave = game.add.button(300,350, 'optionToLeaveImage', leaveFunction, this, 2, 1 ,0);
            }
            if(trapRoom){
                dexTestNeeded = true; //Alert the system that a dex test is needed, don't accept other button inputs for now
                buttonAdvance.loadTexture('trapDodge'); //Update the button texture to a new image
            }
            if(monsterRoom){
                strTestNeeded = true; //Alert the system a strength test is needed, don't accept other button inputs
                buttonAdvance.loadTexture('battleImage'); //Update the button texture to a new image for fighting a round of combat
            }
            if(bossRoom){
                bossFightNeeded = true; //Alert the system a boss fight is needed
                buttonAdvance.loadTexture('battleImage'); //Update the button texture to a new image 
            }
            playerPressButton = false;
            endGame++;
        }
        
        
    }
    //Function for when the player wishes to end the dungeon early
    function leaveFunction(){
        endGame = 52; //Just manually set the endGame state for if they explored all rooms
    }

    function button(){
        //This is the overall function for when the player presses the main button.
        //Can advance a room, fight a round of combat or try and dodge a trap

        if(dexTestNeeded==false && strTestNeeded==false && bossFightNeeded==false){newRoom();}
        if(dexTestNeeded){trap();}
        if(strTestNeeded || bossFightNeeded){battle();}
    }
    
    function newRoom(){
        //Function that advances one room
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

        if(optionToLeave){buttonOptionToLeave.destroy();}

        optionToLeave = false;

        if(merchantAvailable){ //Delete merchant buttons if they were there and any options to buy stuff the player didn't buy
            merchant.destroy();
            if(hasSword==false){buttonBuySword.destroy();}
            if(hasArmor==false){buttonBuyArmor.destroy();}
            if(hasPotion==false){buttonBuyPotion.destroy();}
        }

        merchantAvailable = false;
        
        
        //Next generate a random number to compare to a series of rooms
        var rndSeed = game.rnd.integerInRange(1,11);
        
        
        //debug
        //var rndSeed = 11; debugCounter++; treasure = treasure+60;
        //if(debugCounter>=2){var rndSeed = game.rnd.integerInRange(1,11);}
        

        if(rndSeed==11){
            //Only display the merchant if the player could buy anything
            if(hasPotion==false || hasSword==false || hasArmor==false){
                merchantAvailable = true;
                //The player has encountered a merchant, create a sprite for the merchant and give the player the chance to buy stuff
                merchant = game.add.sprite(600, 200, 'merchantImage');
                if(hasSword==false){buttonBuySword = game.add.button(750, 200, 'swordBuyImage', buySword, this, 2, 1, 0);}       
                if(hasArmor==false){buttonBuyArmor = game.add.button(750, 350, 'armorBuyImage', buyArmor, this, 2, 1, 0);}     
                if(hasPotion==false){buttonBuyPotion = game.add.button(750, 500, 'potionBuyImage', buyPotion, this, 2, 1, 0);}         
            }
            if(hasPotion && hasSword && hasArmor){rndSeed = 3;} // just treat this as an empty room if the player bought everything
        }
        
        //Empty Room treasure, generates a random amount of treasure and adds it to the players total
        if(rndSeed==1 || rndSeed==2){
            emptyRoomTreasure = true;
            treasureAmount = game.rnd.integerInRange(1,10); //Generate 1-10 treasure at random
        }
        
        
        //Empty Room rest, restore 1 mana and health
        if(rndSeed==3){
            emptyRoomRest = true;
        }
        
        //Empty room with a chance to leave the dungeon early
        if(rndSeed == 4){
            optionToLeave = true;
        }

        //trap, role against dex
        if(rndSeed==5){
            trapRoom = true;
            //dexTestNeeded = true;
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
            //dexTestNeeded = true;
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

    //Function that handles battles
    function battle(){

        armorBlockedDamage = false; //wipe the internal variable for whether the players armor blocked damage

        if(strTestNeeded){ //Only do anything if the game is waiting for the player to take a strength test

            //First role the dice
            strRole = roleDice();
            finalResult = str + strRole;

            if(finalResult<monsterStr){
                //Player took damage don't let them exit the loop
                //Check if they have armor and see if they avoid the damage
                if(hasArmor){
                    var chance = roleDice();
                    if(chance>3){curHealth++; armorBlockedDamage = true;}//Just add a hitpoint first then it will be subtracted for no damage
                }
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
                if(hasArmor){ //Check if armor blocks the damage
                    var chance = roleDice();
                    if(chance>3){curHealth++; armorBlockedDamage = true;}//Just add a hitpoint first then it will be subtracted for no damage
                }
                if(bossLightingTest){ //If the boss had lighting strike deal 2 damage instead of 1
                    curHealth = curHealth - 2;
                    if(armorBlockedDamage){curHealth++;} //Adds an extra health point back to make up for the boss hitting twice if the armor blocked
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
        //First we role the dice and add dex
        if(dexTestNeeded){
            var dexRole = roleDice();
            var finalResult = dex + dexRole;
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

    function buySword(){
        //Create sword sprite near image and raise str/mana by 1, pay 20 treasure (only if enough)
        if(treasure>=10){
            treasure = treasure - 10;
            hasSword = true;
            str++;
            maxMana++;
            curMana++;
            swordIcon = game.add.sprite(150, 200, 'swordImage');
            buttonBuySword.destroy();
        }
    }

    function buyArmor(){
        //Activate "hasArmor" and add armor sprite near image, pay 20 treasure
        //Modify battle() to check hasArmor and role 50/50 chance to avoid damage
        if(treasure>=10){
            treasure = treasure - 10;
            hasArmor = true;
            armorIcon = game.add.sprite(300,200, 'armorImage');
            buttonBuyArmor.destroy()
        }
    }

    function buyPotion(){
        //Add buttonPotion near sprite image, pay 10 treasure, delete the option to buy it
        if(treasure>=5){
            treasure = treasure - 5;
            hasPotion = true;
            potionButton = game.add.button(450, 200, 'potionImage', drinkPotion, this, 2, 1, 0);
            buttonBuyPotion.destroy();
        }
    }

    function drinkPotion(){
        //set curHealth to maxHealth, delete this button
        curHealth = maxHealth
        potionButton.destroy();
        hasPotion = false;
    }
    

    
    function roleForBossEffect(){
        //Function that roles to see what random effect the boss has

        var rndSeed = game.rnd.integerInRange(1,3);
        if(rndSeed==1 && playerLevel<1){rndSeed++;} //Don't let the player encounter extra strong to early, otherwise they can be stuck
        if(rndSeed==1){bossStr = bossStr + 3; bossExtraStr = true;} //Increase boss strength
        if(rndSeed==2){bossLightingTest = true;} //lighting strike
        if(rndSeed==3){manaDrain = true; bossManaDrain = true;} //Mana drain
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
        if(playerLevel<3){game.debug.text('You have '+xp+' xp so far.  Every 4 xp you level up.  The max level is 3', 50, 72);}
        if(playerLevel==3){game.debug.text('You are at max level!', 50, 72);}
        game.debug.text('You are level '+playerLevel+' each time you level up your stats are increased by 1', 50, 84);

        //Text showing current room they are in
        var curRoom = "outside dungeon"; //Default text for when the player hasn't pressed a button yet
        if(emptyRoomTreasure){curRoom = "A room filled with Treasure!  You sweep it up and add it to your stash";}
        if(emptyRoomRest){curRoom = "An empty and barron room, you take some time to rest and recover health and mana";}
        if(trapRoom){curRoom = "It's a Trap! Trap level is: "+trapLevel;}
        if(monsterRoom){curRoom = "A room with a monster! Monster strength is: "+monsterStr;}
        if(bossRoom){curRoom = "A room with a boss! Boss strength is: "+bossStr;}
        if(optionToLeave){curRoom = 'You find a shortcut to the surface, do you want to leave the dungeon?';}
        if(merchantAvailable){curRoom = 'You found a merchant.  Would you like to buy something?'};
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
            if(armorBlockedDamage){game.debug.text('You get hit. but your armor absorbs the blow', 50, 176);}
            if(armorBlockedDamage==false){game.debug.text('Ouch! You get hit by the monster and lose 1 health, try battling again.', 50, 176);}
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
            game.debug.text('This boss has an aura that saps your mana!  You will lose mana each round', 50, 176);
        }
        if(bossBattleOutcome == 0){
            if(armorBlockedDamage){game.debug.text('You get hit. but your armor absorbs the blow', 50, 176);}
            if(armorBlockedDamage==false){game.debug.text('Ouch! You get hit by the boss and take damage', 50, 189);}
        }
        
        if(bossBattleOutcome == 1){
            game.debug.text('You manage to defeat the boss! You earn extra xp and some treasure', 50, 189);
        }
        

        //End game states

        if(playerHasDied){
            game.debug.text('You have been reduced to 0 health, game over', 50, 130);
        }

        if(endGame==52){
            game.debug.text('Congrats! You finished the dungeon, your final treasure count is:'+treasure, 50, 130);
        }
    }
}
