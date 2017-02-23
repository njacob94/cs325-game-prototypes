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

        game.load.image('example', 'assets/example.png');
    }

    function create() {

        //White Background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';

        //Arrow button creation
        buttonUp = game.add.button(750,250, 'arrowUp', moveUp, this, 2, 1, 0);
        buttonDown = game.add.button(750,400, 'arrowDown', moveDown, this, 2, 1, 0);
        buttonLeft = game.add.button(650,350, 'arrowLeft', moveLeft, this, 2, 1, 0);
        buttonRight = game.add.button(800,350, 'arrowRight', moveRight, this, 2, 1, 0);

        //Add mark button creation
        buttonAddMark = game.add.button(725, 150, 'rock', addMark, this, 2, 1, 0);

        //Add a sprite that shows an example
        //example = game.add.sprite(650, 525, 'example')

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
                if(grid[i][j] == 'r'){toDelete = squareDeleteCheck('r','p',i,j);}
                if(grid[i][j] == 'p'){toDelete = squareDeleteCheck('p','s',i,j);}
                if(grid[i][j] == 's'){toDelete = squareDeleteCheck('s','r',i,j);}
                //Change square to empty if we need to delete
                if(toDelete){grid[i][j]='e';}
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

        //Finally check to see if a draw happened (search for if any squares still are empty)
        /*
        emptyMoveLeft = false;
        for(i=0; i<=3; i++){
            for(j=0; j<=3; j++){
                if(grid[i][j] == 'e'){emptyLeft = true;}
            }
        }
        if(emptyLeft == false){noMoveLeft = true;}
        */
        

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
        game.debug.text(grid[0], 700, 1032);
        game.debug.text(grid[1], 700, 1044);
        game.debug.text(grid[2], 700, 1056);
        game.debug.text(grid[3], 700, 1068);
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
}