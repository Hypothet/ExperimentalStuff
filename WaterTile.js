import { default as Population } from "./Population.js";
import { default as Ship } from "./Ship.js";
import Troop from "./Troop.js";

export default class WaterTile{


    terrain;
    ship;

    

    constructor(terrain){
        this.terrain = terrain;
        
    }

    createNewShipWithLandTile(thisWaterTile, oldLandTile){
        var oldPop = oldLandTile.tileType.population;

        const oldLandTroops = oldPop.getMilitia(); 

        // make sure old land tile has enough pop and there is a ship to set sail
        //console.log(oldLandTile.population - oldLandTile.population.getTroops());
        if (oldLandTroops > 1 && oldPop.colony.currentShipBuild > oldPop.colony.shipProductionCost){

            var newPop = new Population(oldLandTroops, oldPop.colony) 
            newPop.setCultureValuesFromAnotherPop(oldPop);

            // decrease old tiles pop b/c of troops taken
            oldLandTile.tileType.population.decreasePop(oldLandTroops);

            // create new ship and add it to this water tile
            this.ship = new Ship(newPop);
            this.ship.population.troop.troopCount = oldPop.getFractionOfReserveTroops();

            //TODO need to set this up with colonies
            this.ship.setShipValuesFromColony();

            thisWaterTile.toDraw = true;
            thisWaterTile.isEmpty = false;
            thisWaterTile.isNew = true;

            // increase colonies current naval and decrease naval ship build (by production cost of ship)
            oldPop.colony.currentActiveShips ++;
            oldPop.colony.currentShipBuild -= oldPop.colony.shipProductionCost;

        }
        
    }


    landOnFriendlyTileFromWater(thisTile, landTile){
        landTile.tileType.population.pop += thisTile.tileType.ship.population.pop;
        
        landTile.tileType.population.troop.troopCount += this.ship.population.troop.troopCount;
    
        this.ship.population.colony.currentShipBuild += this.ship.population.colony.shipProductionCost;
        this.emptyTileDecreaseActiveShips(thisTile);
    }  

    moveShipToEmptyWaterTile(thisTile,newWaterTile){

        newWaterTile.tileType.ship = this.ship;
        this.ship = null;

        thisTile.toDraw = true;
        thisTile.isEmpty = true;
        thisTile.isNew = true;


        newWaterTile.toDraw = true;
        newWaterTile.isEmpty = false;
        newWaterTile.isNew = true;

    }

    moveShipToEmptyLandAndSettle(thisTile, newLandTile){
        //console.log(this.ship.population);
        // create new Population
        var newLandPop = newLandTile.tileType.population;
        newLandPop.colony = this.ship.population.colony;
        newLandPop.pop = this.ship.population.pop;

        //sets new cultures from ship
        newLandPop.setCultureValuesFromAnotherPop(this.ship.population);
        


        thisTile.toDraw = true;
        thisTile.isEmpty = true;
        thisTile.isNew = true;


        newLandTile.toDraw = true;
        newLandTile.isEmpty = false;
        newLandTile.isNew = true;
        newLandTile.isOccupiedLand = true;


    }


    getCombinedShipSiegeAttack(){
        //TODO make a more specific siege attack
        var thisPop = this.ship.population;

        return (thisPop.colony.milStrength + thisPop.cultureAttack + thisPop.colony.attack) * this.terrain.geoAttack;
    }

    siegeLandTileFromWater(thisTile, defenderTile){
        const defenderPop = defenderTile.tileType.population;
        defenderTile.tileType.inCombat = true;

        var thisPop = this.ship.population;
        //var outcome = Math.floor((this.getTroops() * thisTile.getCombinedAttack()) - (defenderPop.getTroops() * defenderTile.getCombinedDefense()));

        // console.log(defenderPop.getTroops());
        // console.log(defenderPop);
        const totalThisFighting = thisPop.getTroops() + thisPop.getMilitia();
        const totalDefenderFighting = defenderPop.getTroops() + defenderPop.getMilitia();

        var outcome = Math.floor((totalThisFighting * this.getCombinedShipSiegeAttack() * thisPop.troop.morale) 
        - (totalDefenderFighting * defenderTile.getCombinedDefense() * defenderPop.troop.morale));


        // console.log("====");
        // console.log(`${thisTile.y}, ${thisTile.x} | ${thisPop.getTroops()} | ${thisPop.getMilitia()}`)
        // console.log(`${defenderTile.y}, ${defenderTile.x} | ${defenderPop.getTroops()} | ${defenderPop.getMilitia()}`);
        // console.log(`Troops ${thisPop.colony.teamId}: ${totalThisFighting} | Attack: ${this.getCombinedShipSiegeAttack()} `);
        // console.log(`Troops ${defenderPop.colony.teamId}: ${totalDefenderFighting} | Defense: ${defenderTile.getCombinedDefense()} `);
        // console.log(`Outcome: ${outcome}`);

        // console.log(outcome);
        if (outcome >0){
            // Attackers won
            const troops = thisPop.getTroops();
            const militia = thisPop.getMilitia();

            const remainingFighting = Math.ceil(outcome/this.getCombinedShipSiegeAttack())

            if (troops >= 1 && militia == 0){
                //only troops
                // console.log(`${this.troop.troopCount} = ${troops} - ${remainingFighting}`)
                thisPop.troop.troopCount -= troops - remainingFighting;
            }else if (militia >= 1 && troops == 0){
                //only militia
                // console.log(`${this.pop} = ${militia} - ${remainingFighting}`)
                thisPop.pop -= militia - remainingFighting;

            }else if (militia >= 1 && troops >= 1) {
                //both
                // console.log("BOTH LOSE");

                const troopRatio = troops/totalThisFighting;
                const militiaRatio = militia/totalThisFighting;

                const aliveTroops = Math.floor(remainingFighting*troopRatio);
                const aliveMilitia = Math.floor(remainingFighting*militiaRatio);

                // console.log(`${this.troop.troopCount} = ${troops} - ${aliveTroops}`)
                // console.log(`${this.pop} = ${militia} - ${aliveMilitia}`)

                thisPop.troop.troopCount -= troops - aliveTroops;
                thisPop.pop -= militia - aliveMilitia;
            }
            //TODO troops retreat
            defenderPop.pop -= defenderPop.getMilitia();
            defenderPop.lostBattleAsDefender();

            return true;
            // console.log(`Attck Troops: ${this.troop.troopCount} | Pop: ${this.pop}`);

        }else if (outcome == 0){
            //both die
            thisPop.pop -= thisPop.getMilitia();
            thisPop.troop.troopCount = 0;

            defenderPop.pop -= defenderPop.getMilitia()
            defenderPop.troop.troopCount = 0;

            this.emptyTileDecreaseActiveShips(thisTile);
            // console.log(`Attck Pop: ${this.pop} | Def Pop: ${defenderPop.pop}`);
            return false

        }else{
            // Defenders/enemies Won 
            outcome *= -1;
            const remainingFighting = Math.ceil(outcome/defenderTile.getCombinedDefense())

            const troops = defenderPop.getTroops();
            const militia = defenderPop.getMilitia();


            if (troops >= 1 && militia == 0){
                //only troops
                // console.log(`${defenderPop.troop.troopCount} -= ${troops} - ${remainingFighting}`)
                defenderPop.troop.troopCount -= troops - remainingFighting;
                
            }
            else if (militia >= 1 && troops == 0){
                //only militia
                // console.log(`${defenderPop.pop} -= ${militia} - ${remainingFighting}`)
                defenderPop.pop -= militia - remainingFighting;

            }
            else if (militia >= 1 && troops >= 1) {
                //both
                const troopRatio = troops/totalDefenderFighting;
                const militiaRatio = militia/totalDefenderFighting;

                const aliveTroops = Math.floor(remainingFighting*troopRatio);
                const aliveMilitia = Math.floor(remainingFighting*militiaRatio);

                // console.log(`${defenderPop.troop.troopCount} -= ${troops} - ${aliveTroops}`)
                // console.log(`${defenderPop.pop} -= ${militia} - ${aliveMilitia}`)

                defenderPop.troop.troopCount -= troops - aliveTroops;
                defenderPop.pop -= militia - aliveMilitia;

            }
            // console.log(`Def Troops: ${defenderPop.troop.troopCount} | Pop: ${defenderPop.pop}`);

            // console.log("__________");
            thisPop.pop -= thisPop.getMilitia();
            defenderPop.lostBattleAsDefender();
            this.emptyTileDecreaseActiveShips(thisTile);

            return false;
        }
    } 

    takeOverLandTileAfterSiege(thisTile, landTile){
        //console.log("WON SIEGE");
        

        //TODO try linking with pop tranfer from attacker pop
        landTile.tileType.population.tranferStatsFromAttackerTile(landTile, this.ship.population)
        landTile.tileType.population.pop += this.ship.population.pop;
        landTile.tileType.population.troop.troopCount += this.ship.population.troop.troopCount;

        landTile.toDraw = true;
        landTile.isNew = true;
        //console.log(this);
        this.emptyTileDecreaseActiveShips(thisTile);
        
        //TODO does not remove ship, just makes it not active (dont have to rebuild) - might already be doing that -
    }

    emptyTile(thisTile){
        //console.log(thisTile);

        thisTile.isEmpty = true;
        thisTile.toDraw = true;
        thisTile.isNew = true;
        this.ship = null;
    }

    emptyTileDecreaseActiveShips(thisTile){
        //console.log(thisTile);

        thisTile.isEmpty = true;
        thisTile.toDraw = true;
        thisTile.isNew = true;
        this.ship.population.colony.currentActiveShips -= 1;
        thisTile.tileType.ship = null;

        //console.log("Making:" ,thisTile.x, thisTile.y , " Ship null")

    }

    attackEnemyNavalShip(thisTile, enemyTile){
        var outcome = this.ship.strength - enemyTile.tileType.ship.strength;

        if (outcome > 0){
            // this ship won
            this.ship.health - outcome;
            enemyTile.tileType.emptyTileDecreaseActiveShips();
            if (this.ship.checkIfSunk()){
                this.emptyTileDecreaseActiveShips(thisTile);
            }

        }else{
            //enemy ship won

            outcome *= -1;
            enemyTile.tileType.ship.health - outcome;

            if (enemyTile.tileType.ship.checkIfSunk()){
                enemyTile.tileType.emptyTileDecreaseActiveShips(enemyTile);
            }
        }
    }

 

}
