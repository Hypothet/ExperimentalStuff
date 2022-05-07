import { default as WaterTile} from "./WaterTile.js";

export default class LandTile{
    terrain;
    inCombat = false;


    //TODO set population to here, no population on tile, just landTile
    population;

    constructor(terrain){
        this.terrain = terrain;
    }

    setPopulation(population){
        this.population = population;
    }

    // check all tiles in array
    //TODO make it random?
    checkIfInCombat(thisTile, board, colonySurround, enemySurround){
        const boardWidth = board[0].length;
        const boardHieght = board.length;
        var combat = false;
        if (thisTile.x -1 > 0 && thisTile.x + 1 < boardWidth && thisTile.y -1 > 0 && thisTile.y + 1 < boardHieght){
            //console.log("-=-=-=-");

            if (this.checkIfTileHasEnemyId(board[thisTile.y-1][thisTile.x-1], colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y][thisTile.x-1], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y+1][thisTile.x-1], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y-1][thisTile.x], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y+1][thisTile.x], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y-1][thisTile.x+1], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y][thisTile.x+1], colonySurround,enemySurround)){
                combat = true;

            }
            if (this.checkIfTileHasEnemyId(board[thisTile.y+1][thisTile.x+1], colonySurround,enemySurround)){
                combat = true;

            }  
  
           
            return combat;
         }
        else{
            //console.log("ELSE");
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y-1, thisTile.x-1,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y, thisTile.x-1,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y+1, thisTile.x-1,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y-1, thisTile.x,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y+1, thisTile.x,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y-1, thisTile.x+1,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y, thisTile.x+1,board, colonySurround,enemySurround)){
                combat = true;
            }
            if (this.checkIfTileHasEnemyIdAlongBorder(thisTile.y+1, thisTile.x+1,board, colonySurround,enemySurround)){
                combat = true;
            }  
            return combat;
        }
    }

    checkIfTileHasEnemyId(otherTile, colonySurround, enemySurround){

        if (otherTile.isOccupiedLand){
            //TODO add allies condition (if alllies dont push anywhere maybe)
            if(otherTile.tileType.population.colony.teamId === this.population.colony.teamId){
                colonySurround.push(otherTile);
                return false;
            }else{         
                enemySurround.push(otherTile);
                return true;
            }
        }else{
            return false;
        }
    }

    checkIfTileHasEnemyIdAlongBorder(y,x,gameBoard, colonySurround, enemySurround){
    
        if (x >= 0 && x < gameBoard[0].length && y>= 0 && y< gameBoard.length){
            const otherTile = gameBoard[y][x];
            if (otherTile.isOccupiedLand){
                //TODO add allies condition (if alllies dont push anywhere maybe)
                if(otherTile.tileType.population.colony.teamId === this.population.colony.teamId){
                    colonySurround.push(otherTile);
                    return false;
                }else{         
                    enemySurround.push(otherTile);
                    return true;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }   
    }
}
    
    
    
