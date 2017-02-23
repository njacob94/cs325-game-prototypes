window.onload = function() {

    var game = new Phaser.Game(1200, 1200, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render : render });

    //The grid, list of 4 rows
    var grid = [
        [],
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

    var playerTurn = 1; //Players turn counter, 1 is rock, 2 is scissors and 3 is paper


    // ---Set up code ---
    function preload () {        
        game.load.image('paper', 'assets/paper.png')
        game.load.image('rock', 'assets/rock.png')
        game.load.image('scissors', 'assets/scissors.png')
        game.load.image('empty', 'assets/empty.png')
    }

    function create() {

        //White Background
        game.stage.backgroundColor = 'rgb(255, 255, 255)';

        //Double for loop to generate buttons across the screen
        //Each button is 100x100 pixels and needs 50 pixels on each direcetion around them.  
        //The rows start at 50 pixels from the top and end 50 pixels from the bottom
        //the cols start at 50 pixels from the left and end 50 pixels from the right
        var x = 50;
        var y = 50;
        var gridSpot;

        for(i = 0; i<4; i++){
            //Generate 4 rows, each row should have 50 pixels between them
            for(j = 0; j<4; j++){
                //Generate 4 cols for each row, 50 pixels between buttons
                gridSpot = new square();
                gridSpot.row = i;
                gridSpot.col = j;
                gridSpot.val = 'e';
                gridSpot.button = game.add.button(x,y, 'empty', addMark, this, 2,1,0);
                grid[i].push(gridSpot)
                x = x + 150;
            }
            x = 50;
            y = y+150;
        }
    }

    // ---Deletion/Safety code---
    function update(){

       //Code for players turn iteration
       var hasWon = false;
       while(hasWon == false){
           //Text it is current players turn
           
           //Upon button click check if anything is deleted
           gridUpdate();

           //Next check if anyone has won

           //If noone has won and updates have been performed advance turn by 1, or if its 3 set back to 1
           playerTurn = playerTurn + 1;
           if(playerTurn = 4){playerTurn = 1;}
       }
    }

    //Function to check if the grid needs anything deleted using a double for loop
    function gridUpdate(){
        //code for updating positions go here, double for loop checks all squares and sees if any can be deleted
        for (i = 0; i<3; i++){
            for(j = 0; j<3; j++){
                //Call grid check and pass the type in the spot and what kind will delete it
                var toDelete = false;
                if(grid[i][j] == 'r'){toDelete = gridCheck('r','p',i,j);}
                if(grid[i][j] == 'p'){toDelete = gridCheck('p','s',i,j);}
                if(grid[i][j] == 's'){toDelete = gridCheck('s','r',i,j);}

                //Change square to empty if we need to delete (or the current position marker if its there)
                if(toDelete){grid[i][j]='e';}
            }
       }
    }

    function winCheck(){
        //Check each square on grid if a win can occur in any direction
        for (i = 0; i<3; i++){
            for(j = 0; j<3; j++){
                
            }
        }
    }

    function winCheckAtSpot(row,col){
        //At this spot in grid start checking to see if 4 in a row can be drawn
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


    function addMark(){
        //Check the players turn when called then add the right mark to the grid while also updating the button image
        
        //Rock
        if(playerTurn = 1){
            this.loadTexture('rock')
        }

        //Scissors
        if(playerTurn = 2){
            this.loadTexture('scissors')
        }

        //Paper
        if(playerTurn = 3){
            this.loadTexture('paper')
        }
    }

    //Grid debugger display
    function render() {
        game.debug.text(grid[0], 32, 32);
        game.debug.text(grid[1], 32, 44);
        game.debug.text(grid[2], 32, 56);
        game.debug.text(grid[3], 32, 68);
    }
}