//Note: yeah code is messy and awkard, when polishing I'll try and make it just compare textures directly rather then the weird double grid thing

window.onload = function() {
    var game = new Phaser.Game(1200, 1200, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render : render });

    //Inital globals
    var grid = [
        ['|', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e'],
        ['e', 'e', 'e', 'e']
    ];

    //For the internal comparison grid we will use | to represent the current pointer location

    var gridDisplay = [[],
                       [],
                       [],
                       []
        ];

    var pointerRow = 0;
    var pointerCol = 0;
    var curPos = 'e'

    var buttonUp;
    var buttonDown;
    var buttonLeft;
    var buttonRight;

    var square;

    var playerTurn = 1; //Players turn counter, 1 is rock, 2 is scissors and 3 is paper

    //Internal variable for keeping track of what position the pointer is at this is

    var currentDeleteRow = 0;
    var currentDeleteCol = 0;
    var currentDisplayRow = 0;
    var currentDisplayCol = 0;


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
    }

    function create() {

        //White Background
        game.stage.backgroundColor = 'rgb(0, 0, 0)';

        //Start creating button areas
        buttonUp = game.add.button(800,500, 'arrowUp', moveUp, this, 2, 1, 0);
        buttonDown = game.add.button(800,650, 'arrowDown', moveDown, this, 2, 1, 0);
        buttonLeft = game.add.button(700,600, 'arrowLeft', moveLeft, this, 2, 1, 0);
        buttonRight = game.add.button(850,600, 'arrowRight', moveRight, this, 2, 1, 0);

        buttonRock = game.add.button(1000,100, 'rock', addRock, this, 2, 1, 0);
        buttonPaper = game.add.button(1000,200, 'paper', addPaper, this, 2, 1, 0);
        buttonScissors = game.add.button(1000,300, 'scissors', addScissors, this, 2, 1, 0);

        var x = 50;
        var y = 50;

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
        //code for updating positions go here, double for loop checks all squares and sees if any can be deleted
        for (i = 0; i<3; i++){
            for(j = 0; j<3; j++){
                //Call grid check and pass the type in the spot and what kind will delete it
                currentDeleteRow = i;
                currentDeleteCol = j;
                var toDelete = false;
                if(grid[i][j] == 'r'){toDelete = gridCheck('r','p',i,j);}
                if(grid[i][j] == 'p'){toDelete = gridCheck('p','s',i,j);}
                if(grid[i][j] == 's'){toDelete = gridCheck('s','r',i,j);}
                if(grid[i][j] == '|'){ 
                   if(curPos == 'r'){toDelete = gridCheck('r','p',i,j);}
                   if(curPos == 'p'){toDelete = gridCheck('p','s',i,j);}
                   if(curPos == 's'){toDelete = gridCheck('s','r',i,j);}
                   if(toDelete){curPos = 'e';}
                }
                //Change square to empty if we need to delete (Don't do it if the curPos mark is here)
                if(toDelete && grid[i][j] != '|'){grid[i][j]='e';}
            }
       }

       //After performing an update to see if any squares need to be updated, update sprite images the player is seeing
       for (i = 0; i<3; i++){
           for(j = 0; j<3; j++){
               //Change all images displayed to true values
               currentDisplayRow = i;
               currentDisplayCol = j;
               if(grid[i][j] == 'e'){gridDisplay[i][j].loadTexture('empty');}
               if(grid[i][j] == 'r'){gridDisplay[i][j].loadTexture('rock');}
               if(grid[i][j] == 'p'){gridDisplay[i][j].loadTexture('paper');}
               if(grid[i][j] == 's'){gridDisplay[i][j].loadTexture('scissors');}
               if(grid[i][j] == '|'){
                   if(curPos == 'e'){gridDisplay[i][j].loadTexture('emptyHighlight');}
                   if(curPos == 'r'){gridDisplay[i][j].loadTexture('rockHighlight');}
                   if(curPos == 'p'){gridDisplay[i][j].loadTexture('paperHighlight');}
                   if(curPos == 's'){gridDisplay[i][j].loadTexture('scissorsHighlight');}
               }
           }
       }
    }

    //Function that decides whether or not to delete the square
    function gridCheck(type, typeDelete, row, col){
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

    
    // ---Buttons---
    function moveUp(){
        if(pointerRow > 0){ //Only move the pointer down if there is room left

            //Change the current position display to no longer be highlighted
            if(curPos == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(curPos == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(curPos == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(curPos == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            //update internal grid
            grid[pointerRow][pointerCol] = curPos //Replace current spot with the old value
            pointerRow = pointerRow - 1; //Proceed up one pointerRow
            curPos = grid[pointerRow][pointerCol]; //Save what the value is there before displaying pointer
            grid[pointerRow][pointerCol] = '|'; //Show pointer on grid

            //Update display to player
            if(curPos=='e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(curPos=='r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(curPos=='s'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(curPos=='p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}
            
        }
    }
    function moveDown(){
        if(pointerRow < 3){ //Only move the pointer down if there is room left

            //Change the current position display to no longer be highlighted
            if(curPos == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(curPos == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(curPos == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(curPos == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            grid[pointerRow][pointerCol] = curPos
            pointerRow = pointerRow + 1; //Proceed down one pointerRow
            curPos = grid[pointerRow][pointerCol];
            grid[pointerRow][pointerCol] = '|';

            //Update display to player
            if(curPos=='e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(curPos=='r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(curPos=='s'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(curPos=='p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}
        }
    }

    function moveRight(){
        if(pointerCol < 3){ //Only move the pointer down if there is room left

            //Change the current position display to no longer be highlighted
            if(curPos == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(curPos == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(curPos == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(curPos == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            grid[pointerRow][pointerCol] = curPos
            pointerCol = pointerCol + 1; //Proceed right one pointerCol
            curPos = grid[pointerRow][pointerCol];
            grid[pointerRow][pointerCol] = '|';

            //Update display to player
            if(curPos=='e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(curPos=='r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(curPos=='s'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(curPos=='p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}
        }
    }
    

   function moveLeft(){
        if(pointerCol > 0){ //Only move the pointer down if there is room left

            //Change the current position display to no longer be highlighted
            if(curPos == 'e'){gridDisplay[pointerRow][pointerCol].loadTexture('empty');}
            if(curPos == 'r'){gridDisplay[pointerRow][pointerCol].loadTexture('rock');}
            if(curPos == 's'){gridDisplay[pointerRow][pointerCol].loadTexture('scissors');}
            if(curPos == 'p'){gridDisplay[pointerRow][pointerCol].loadTexture('paper');}

            //Update pointer position and internal grid
            grid[pointerRow][pointerCol] = curPos
            pointerCol = pointerCol - 1; //Proceed left one pointerCol
            curPos = grid[pointerRow][pointerCol];
            grid[pointerRow][pointerCol] = '|';

            //Update display to player
            if(curPos=='e'){gridDisplay[pointerRow][pointerCol].loadTexture('emptyHighlight');}
            if(curPos=='r'){gridDisplay[pointerRow][pointerCol].loadTexture('rockHighlight');}
            if(curPos=='s'){gridDisplay[pointerRow][pointerCol].loadTexture('scissorsHighlight');}
            if(curPos=='p'){gridDisplay[pointerRow][pointerCol].loadTexture('paperHighlight');}
        }
    }
    

    function addRock(){curPos = 'r';}
    function addPaper(){curPos = 'p';}
    function addScissors(){curPos = 's'}

    //Grid debugger display
    function render() {
        game.debug.text(grid[0], 700, 32);
        game.debug.text(grid[1], 700, 44);
        game.debug.text(grid[2], 700, 56);
        game.debug.text(grid[3], 700, 68);
        game.debug.text('Current size: '+ gridDisplay.length + 'x' + gridDisplay[0].lenth, 700, 90);
        game.debug.text('pointerRow='+pointerRow+': pointerCol='+pointerCol, 700, 102);
        game.debug.text('Current searching to delete in : ('+currentDeleteRow+', '+currentDeleteCol+')', 700, 114);
        game.debug.text('Current searching to display in : ('+currentDisplayRow+', '+currentDisplayCol+')', 700, 126);
    }
}