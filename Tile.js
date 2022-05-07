export default class Tile{

    size;

    toDraw = true;
    isEmpty = true; 
    isNew = true;

    tileType; // TODO WHY IS THIS NOT NEEDED????

    isOccupiedLand = false;

    constructor(x,y,size){
        this.x = x;
        this.y = y;
        this.size = size;
    }
    

    // x value of where to draw tile
    getDrawX(){
        return this.x * this.size;
    }
    
    // y value of where to draw tile
    getDrawY(){
        return this.y * this.size;
    }

    tileTurnDuties(gameBoard){
        this.tileType.population.popTurnDuties(this, gameBoard);   
    }

    getCombinedPopGrowth(){
        return (this.tileType.population.culturePopGrowth + this.tileType.population.colony.popGrowth) * this.tileType.terrain.geoPopGrowth;
    }

    getCombinedAttack(){
        //console.log(this);
        return (this.tileType.population.colony.milStrength + this.tileType.population.cultureAttack + this.tileType.population.colony.attack) * this.tileType.terrain.geoAttack;
    }

    getCombinedDefense(){
        return (this.tileType.population.colony.milStrength + this.tileType.population.cultureDefense + this.tileType.population.colony.defense) * this.tileType.terrain.geoDefense;
    }

    getDrawSize(){
        return this.size;
    }


    convertJElemToTile(jElem){
        

    }
}
