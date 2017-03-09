//Note: yeah code is messy and awkard, when polishing I'll try and make it just compare textures directly rather then the weird double grid thing

window.onload = function() {
    var game = new Phaser.Game(1100, 800, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render : render });

    //Internal Grid for comparisons

    var grid = [
        ['e', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e']
    ];

    //Sprite grid to display graphics to the player
    var gridDisplay = [[],
                       [],
                       [],
                       []
        ];

    var pointerRow = 0;
    var pointerCol = 0;

    var buttonUp;
    var buttonDown;
    var buttonLeft;
    var buttonRight;

    var example;

    var square;

    var playerTurn = 1; //Players turn counter, 1 is rock, 2 is scissors and 3 is paper

    var playerHasWon = false; //Variable for checking whether a player has won
    var playerWonType; //Variable for which player won
    var playerTookTurn = false; //Variable for checking whether or not the player has taken their turn
    var noMoveLeft = false; //Variable for checking whether or not any moves can still be made
    var emptyMoveLeft = true;
    
    var deleteSound;

    // ---Set up code ---
    function preload () {
        game.load.image('arrowUp', 'assets/arrow_up.png');
        game.load.image('arrowDown', 'assets/arrow_down.png');
        game.load.image('arrowLeft', 'assets/arrow_left.png');
        game.load.image('arrowRight', 'assets/arrow_right.png');
        
        game.load.image('paper', 'assets/paper.png');
        game.load.image('rock', 'assets/rock.png');
        game.load.image('scissors', 'assets/scissors.png');
        game.load.image('empty', 'assets/empty.png');

        game.load.image('emptyHighlight', 'assets/emptyHighlight.png');
        game.load.image('rockHighlight', 'assets/rockHighlight.png');
        game.load.image('scissorsHighlight', 'assets/scissorsHighlight.png');
        game.load.image('paperHighlight', 'assets/paperHighlight.png');
        
        game.load.audio('delete', 'assets/explosion.mp3');
        game.load.audio('place', 'assets/addSound.wav');

        game.load.image('moveAI', 'assets/move_AI.png');
    }

    function create() {

        //Black background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';
        
        deleteSound = game.add.audio('delete');
        addSound = game.add.audio('place');

        //Arrow button creation
        buttonUp = game.add.button(750,250, 'arrowUp', moveUp, this, 2, 1, 0);
        buttonDown = game.add.button(750,400, 'arrowDown', moveDown, this, 2, 1, 0);
        buttonLeft = game.add.button(650,350, 'arrowLeft', moveLeft, this, 2, 1, 0);
        buttonRight = game.add.button(800,350, 'arrowRight', moveRight, this, 2, 1, 0);

        //Add mark button creation
        buttonAddMark = game.add.button(725, 150, 'rock', addMark, this, 2, 1, 0);

        //Add button for AI move
        buttonAIMove = game.add.button(825, 150, 'moveAI', moveAI, this, 2, 1, 0);

        var x = 50;
        var y = 150;

        //Generate empty squares for the player to see
        for(i = 0; i<4; i++){
            //Generate 4 rows, each row should have 50 pixels between them
            for(j = 0; j<4; j++){
                //Generate 4 cols for each row, 50 pixels between buttons
                square = game.add.sprite(x,y, 'empty');
                gridDisplay[i].push(square) //add a reference to the square in the gridDisplay list
                x = x + 150;
            }
            x = 50;
            y = y+150;
        }
        gridDisplay[0][0].loadTexture('emptyHighlight'); //Set the 0,0 position to be highlighted to show pointer
    }

    // ---Deletion/Safety code---
    function update(){
        
        //Gameplay loops, rotate between players 
        if(playerTookTurn){ //If a player moves, update grid, change button image and reset
                
            //Rotate to next player
            if (playerTurn<3) {
                playerTurn++;
            } else {
                playerTurn = 1;
            }

            //Update button image for adding a mark
            if(playerTurn == 1){buttonAddMark.loadTexture('rock');}
            if(playerTurn == 2){buttonAddMark.loadTexture('scissors');}
            if(playerTurn == 3){buttonAddMark.loadTexture('paper');}

            //Reset check for player taking turns
            playerTookTurn = false;
        }
        //First check if the last move deleted anything
        for (i = 0; i<=3; i++){
            for(j = 0; j<=3; j++){
                //Call grid check and pass the type in the spot and what kind will delete it
                var toDelete = false;
                /*
                if(grid[i][j] == 'r'){toDelete = squareDeleteCheck('r','p',i,j);}
                if(grid[i][j] == 'p'){toDelete = squareDeleteCheck('p','s',i,j);}
                if(grid[i][j] == 's'){toDelete = squareDeleteCheck('s','r',i,j);}
                */
                if(grid[i][j] == 'r'){toDelete = squareDeleteCheck('r','s',i,j);}
                if(grid[i][j] == 'p'){toDelete = squareDeleteCheck('p','r',i,j);}
                if(grid[i][j] == 's'){toDelete = squareDeleteCheck('s','p',i,j);}
                //Change square to empty if we need to delete
                if(toDelete){
                    deleteSound.play();
                    grid[i][j]='e';
                }
            }
        }

        //Now update the grid images to match the internal grid
        for (i = 0; i<=3; i++){
            for(j = 0; j<=3; j++){
                //Change all images displayed to true values
                if(i==pointerRow && j==pointerCol){ //If its the highlighted row make sure to use highlighted images
                        if(grid[i][j] == 'e'){gridDisplay[i][j].loadTexture('emptyHighlight');}
                        if(grid[i][j] == 'r'){gridDisplay[i][j].loadTexture('rockHighlight');}
                        if(grid[i][j] == 'p'){gridDisplay[i][j].loadTexture('paperHighlight');}
                        if(grid[i][j] == 's'){gridDisplay[i][j].loadTexture('scissorsHighlight');}
                } else{ //Otherwise just use regular images
                    if(grid[i][j] == 'e'){gridDisplay[i][j].loadTexture('empty');}
                    if(grid[i][j] == 'r'){gridDisplay[i][j].loadTexture('rock');}
                    if(grid[i][j] == 'p'){gridDisplay[i][j].loadTexture('paper');}
                    if(grid[i][j] == 's'){gridDisplay[i][j].loadTexture('scissors');}
                }
            }
        }

        
        //Finally run a check to see if a player drew 4
        for(i=0; i<=3; i++){
            //First check the rows for 4 in a row
            if(grid[i][0] != 'e'){
                var allSame = true;
                for(k=0;k<=3;k++){
                    if(grid[i][k]!=grid[i][0]){allSame = false;}
                }

                if(allSame){playerHasWon = true; playerWonType = grid[i][0];}
            }
        }
        
        for(j=0; j<=3; j++){
            //Now check collumns for 4 in a row
            if(grid[0][j] != 'e'){
                var allSame = true;
                for(k=0;k<=3;k++){
                    if(grid[k][j] != grid[0][j]){allSame = false;}
                }
                if(allSame){playerHasWon = true; playerWonType = grid[0][j];}
            }
        }

        //Check diagnole lines for 4 in a row
        //Could not get the diagnole loop working so I just hard coded it for now.  I'll fix this when I polish it
        if(grid[0][0]!='e' && grid [3][3] != 'e'){
            if(grid[0][0]==grid[1][1]){
                if(grid[2][2]==grid[3][3]){
                    if(grid[0][0]==grid[3][3]){
                        if(grid[0][0]==grid[2][2]){
                            if(grid[2][2]==grid[1][1]){playerHasWon = true; playerWonType = grid[0][0];}
                        }
                    }
                }
            }
        }
        if(grid[0][3]!='e' && grid [3][0] != 'e'){
            if(grid[0][3]==grid[1][2]){
                if(grid[2][1]==grid[3][0]){
                    if(grid[0][3]==grid[3][0]){
                        if(grid[0][3] == grid[2][1]){
                            if(grid[1][2]==[2][1]){playerHasWon = true; playerWonType = grid[0][3];}
                        }
                    }
                }
            }
        }
    }
    
    // ---Buttons---

    //Movement functions, each of these first turns off the highlight at the current pointer, then shifts the pointer and highlights the current spot
    function moveUp(){
        if(pointerRow > 0){ //Only move the pointer up if there is room left
            //Un-Highlight current spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            pointerRow = pointerRow - 1; //Proceed up one pointerRow

            //Highlight new spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}           
        }
    }
    function moveDown(){
        if(pointerRow < 3){ //Only move the pointer down if there is room left
            //Un-Highlight current spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            pointerRow = pointerRow + 1; //Proceed down one pointerRow
            
            //Highlight new spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}  
        }
    }

    function moveRight(){
        if(pointerCol < 3){ //Only move the pointer right if there is room left
            //Un-Highlight current spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            pointerCol = pointerCol + 1; //Proceed right one pointerCol
            
            //Highlight new spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}  
        }
    }
   function moveLeft(){
        if(pointerCol > 0){ //Only move the pointer left if there is room left
            //Un-Highlight current spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            pointerCol = pointerCol - 1; //Proceed left one pointerCol
            
            //Highlight new spot
            if(grid[pointerRow][pointerCol] == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(grid[pointerRow][pointerCol] == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(grid[pointerRow][pointerCol] == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(grid[pointerRow][pointerCol] == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}  
        }
    }
        
    //This functions change the current pointer area to be rock paper or scissors
    function addMark(){
        if(grid[pointerRow][pointerCol] == 'e'){ //Only add a block if the current spot is empty
            if(playerTurn == 1){grid[pointerRow][pointerCol] = 'r';}
            if(playerTurn == 2){grid[pointerRow][pointerCol] = 's';}
            if(playerTurn == 3){grid[pointerRow][pointerCol] = 'p';}
            addSound.play();
            playerTookTurn = true; //Let system know a player pressed the  button
        } 
    }

    //---Additional Functions---

    //Function that decides whether or not to delete the square
    function squareDeleteCheck(type, typeDelete, row, col){
        //Count how many cardinal directions have stuff to delete
        var numDelete = 0;
        var numSafe = 0;
        var toDelete = false;
        
        //Check all four directions around the square and count how many marks can delete it
        if(row<3){if(grid[row+1][col] == typeDelete){numDelete++;}}
        if(row>0){if(grid[row-1][col] == typeDelete){numDelete++;}}
        if(col<3){if(grid[row][col+1] == typeDelete){numDelete++;}}
        if(col>0){if(grid[row][col-1] == typeDelete){numDelete++;}}

        //Check all 4 directions and count how many of the same mark are present
        if(row<3){if(grid[row+1][col] == type){numSafe++;}}
        if(row>0){if(grid[row-1][col] == type){numSafe++;}}
        if(col<3){if(grid[row][col+1] == type){numSafe++;}}
        if(col>0){if(grid[row][col-1] == type){numSafe++;}}
        
        //If at least 2 marks around the square are the kind that delete 
        //and it doesn't have at least 2 marks of the same type around it then delete it
        if(numDelete>=2 && numSafe<2){toDelete = true;}

        return toDelete;
    }

    //Grid debugger display, all of this is commented out for now
    function render() {
        /*
        game.debug.text('Internal grid for debugging (comment out)', 700, 20);
        game.debug.text(grid[0], 700, 32);
        game.debug.text(grid[1], 700, 44);
        game.debug.text(grid[2], 700, 56);
        game.debug.text(grid[3], 700, 68);
        game.debug.text('pointerRow='+pointerRow+': pointerCol='+pointerCol, 700, 1090);
        */      
        
        
        game.debug.text('Welcome to Rock/Paper/Scissors draw 4', 50, 20);
        game.debug.text('Find 2 friends and each of you selects a a type to be, rock/paper/scissors', 50, 32);
        game.debug.text('Use the arrows to navigate to a square and place your mark by hitting the button when its your turn', 50, 45);
        game.debug.text('The first player to draw 4 in a row horizontally/vertically/diagonally wins!', 50, 58);
        game.debug.text('In this game, Rock deletes Scissors, Scissors deletes Paper and Paper deletes rock', 50, 71)
        game.debug.text('A mark with 2 sides around it holding a mark that deletes it, is removed', 50, 84);
        game.debug.text('A mark is safe from deletion if it has at least 2 of the same mark on its side', 50, 97);
        game.debug.text('Good luck!', 50, 110);
        

        var player;
        if(playerTurn == 1){player = 'Rock';}
        if(playerTurn == 2){player = 'Scissor';}
        if(playerTurn == 3){player = 'Paper';}

        var victoryText;
        if(playerWonType == 'r'){victoryText = 'Rock has won!';}
        if(playerWonType == 's'){victoryText = 'Scissors has won!';}
        if(playerWonType == 'p'){victoryText = 'Paper has won!';}
        
        game.debug.text('Currently players turn: '+player, 675, 132);
        if(playerHasWon){game.debug.text(victoryText, 675, 144);}
        if(noMoveLeft && (playerHasWon == false)){game.debug.text('Draw, no moves left', 675, 144)}
    }

    //Internal function the AI uses when testing, will force deletion of a mark at a certain spot
    function removeMark(){grid[pointerRow][pointerCol] = 'e';}

    function moveAI(){
        //This function mhas the computer make a random move for the player
        
        //First create a new list for possible moves, one list stores the possible rows and the other possible cols, by taking the same spot on both you have
        //a possible move
        var possibleMovesRows = [];
        var possibleMovesCols = [];

        //An optimal row/col for if the AI can delete anything
        var optimalRow = 4;
        var optimalCol = 4;


        //Set var type, for passing later
        var type; //The type for the players move
        var typeDelete; //The type that deletes the AI
        var typeSafe; //The type that the is safe and AI can delete
        if(playerTurn == 1){type = 'r'; typeDelete = 'p'; typeSafe = 's';}
        if(playerTurn == 2){type = 's'; typeDelete = 'r'; typeSafe = 'p';}
        if(playerTurn == 3){type = 'p'; typeDelete = 's'; typeSafe = 'r';}


        //Start a double for loop search of the entire tree
        for (i = 0; i<=3; i++){
            for(j = 0; j<=3; j++){
                //For each pointer spot, check the following
                var isEmpty = false;
                //Is it empty?
                if(grid[i][j] == 'e'){isEmpty = true;}

                //Would moving here cause it to be deleted?
                var notSafe = squareDeleteCheck(type, typeSafe, i, j);

                //If neither of the above is true put it into the list for possible random moves (stored in 2 numbered lists)
                if(isEmpty == true && notSafe == false){
                    possibleMovesRows.push(i); 
                    possibleMovesCols.push(j); 
                    //Check if this move will delete anything, in which case we will prioritize it

                    //Set the pointers to the spot
                    pointerRow = i;
                    pointerCol = j;
                    addMark(); //Add the mark
                    //Run checks to see if any squares would be deleted as a result
                    if(i>0){var deleteUp = squareDeleteCheck(typeDelete, typeSafe, i-1, j);}
                    if(i<3){var deleteDown = squareDeleteCheck(typeDelete, typeSafe, i+1, j);}
                    if(j>0){var deleteLeft = squareDeleteCheck(typeDelete, typeSafe, i, j-1);}
                    if(j<3){var deleteRight = squareDeleteCheck(typeDelete, typeSafe, i, j+1);}
                    /*
                    if(i>0){var deleteUp = squareDeleteCheck(typeSafe, type, i-1, j);}
                    if(i<3){var deleteDown = squareDeleteCheck(typeSafe, type, i+1, j);}
                    if(j>0){var deleteLeft = squareDeleteCheck(typeSafe, type, i, j-1);}
                    if(j<3){var deleteRight = squareDeleteCheck(typeSafe, type, i, j+1);}
                    */
                    if(deleteUp || deleteDown || deleteLeft || deleteRight){optimalRow = i; optimalCol = j;} //If yes, then set this an optimal move
                    removeMark(); //Remove the mark and continue searching
                }                
            }
        }
        
        //First check our list to make sure it isn't empty, if it is we can just skip the AI turn and do nothing as there are no good moves left
        if(possibleMovesCols.length == 0){playerTookTurn = true;}        

        //If the list wasn't empty then check the list of possible moves compiled and pick one at random and set the pointer to that
        if(optimalRow == 4 && optimalCol == 4){
            var range = possibleMovesCols.length - 1;
            var move = game.rnd.integerInRange(0, range);
            pointerRow = possibleMovesRows[move];
            pointerCol = possibleMovesCols[move];
            addMark();
        }else{
            pointerRow = optimalRow;
            pointerCol = optimalCol;
            addMark();
        }
    }
}
