import LandTile from "./LandTile.js";
import Troop from "./Troop.js";
import TroopBarrack from "./TroopBarrack.js";

export default class Population{


    // values:

    NUM_TO_POP_GROWTH = 1; // number needed to reach in order to increase pop
    POP_NEEDED_TO_EXPAND = 3; // 10
    POP_NEEDED_TO_MIGRATE = 20; // 50 
    MIGRATION_DIVIDER = 5; // 50

    POP_GROWTH_DIVIDER = 1; // 1000
    TROOP_DIVIDER = 100; //100 Percentage, keep 100
    POP_GROWTH_LIMIT = 30; // 10 (unkown if needed)

    INCREASE_ATTACK_DEFENSE_MUTATE = 1;

    INCREASE_DEFENSE_AFTER_VICTORY = .05;
    INCREASE_ATTACK_AFTER_VICTORY = .01;
    DECREASE_ATTACK_AFTER_LOSS = .01;
    DECREASE_DEFENSE_AFTER_LOSS = .01;

    MIN_ATTACK_AND_DEFENSE = .1;

    tilePopCap = Math.random()*2000;

    troop;

    troopBarrack;
    tile;

    cultureName;

    colonyControl = 1; // colonial control over a population 100 == full control

    constructor(pop, colony){
        this.pop = pop;
        this.colony = colony;
        this.troopBarrack = new TroopBarrack();
        this.troop = new Troop(0,this.colony, 1,1);
    }

    /// transfering ///

    setCultureValues(attack, defense, recruitPerc, popGrowth, expandRate){
        // console.log(attack);
        // console.log(defense);
        // console.log(recruitPerc);
        // console.log(popGrowth);
        // console.log(expandRate);



        this.cultureAttack = attack;
        this.cultureDefense = defense;
        this.culturePopGrowth = popGrowth;
        this.cultureRecruitPerc = recruitPerc;
        this.cultureExpandRate = expandRate;
    }

    setCultureValuesFromAnotherPop(anotherPop){
        // console.log(anotherPop);
        // console.log(anotherPop.cultureAttack);
        // console.log(anotherPop.cultureDefense);
        // console.log(anotherPop.cultureRecruitPerc);
        // console.log(anotherPop.culturePopGrowth);
        // console.log(anotherPop.cultureExpandRate);
        this.cultureName = anotherPop.cultureName;

        this.setCultureValues(anotherPop.cultureAttack, anotherPop.cultureDefense, anotherPop.cultureRecruitPerc, anotherPop.culturePopGrowth, anotherPop.cultureExpandRate);
    }

    setTransferStatsFromOldTileToEmptyTile(thisTile, oldTile, migrateDivider=3){
        // make sure old tile has enough pop to donate
        // maybe make it so old tile doesnt donate pop if newtile has more
        if (oldTile.tileType.population.pop > 2){

            const donatedPop = Math.ceil(oldTile.tileType.population.pop/migrateDivider);
            this.pop += donatedPop;
            oldTile.tileType.population.pop -= donatedPop; 
            
            this.colony = oldTile.tileType.population.colony;


            this.setCultureValuesFromAnotherPop(oldTile.tileType.population);
            
            this.cultureAttack = oldTile.tileType.population.cultureAttack;
            this.cultureDefense = oldTile.tileType.population.cultureDefense;

            thisTile.toDraw = true;
            thisTile.isEmpty = false;
            thisTile.isNew = true;
            thisTile.isOccupiedLand = true;

            //TODO fix how tiles are calculated

            //increase colony tile stat
            //this.colony.totalTiles ++;


            //console.log(oldTile)
            //console.log(thisTile)


            //increase colony new tiles
            this.colony.increaseNewTilesByOne();
        }else{
            console.log("LOWER THAN 2 " + oldTile.x, oldTile.y , oldTile.pop);
        }
    }

    setStatsForInitialPlacement(thisTile, colony, pop){

        this.setCultureValues(colony.attack, colony.defense, colony.recruitPerc, colony.popGrowth, colony.expandRate);
        this.colony = colony;
        this.colony.totalTiles ++;
        this.pop = pop;
        this.cultureName = colony.teamId;

        thisTile.isEmpty = false;
        thisTile.isNew = false
        thisTile.toDraw = true;
        thisTile.isOccupiedLand = true;
    } 

    trainTroop(thisTile){
        //TODO cost supply to create troop?? or time??
        this.troopBarrack.trainTroops(this);
    }

    // randomly sees if tile should expand
    attemptToExpand(){
        
        if (this.pop > this.POP_NEEDED_TO_EXPAND){
           //console.log("Pop Is big enough");

            const expandNumber = Math.floor(Math.random()*100);
            //console.log("ExpandNum:", expandNumber < (this.cultureExpandRate + this.colony.expandRate))
        
            //console.log(this.cultureExpandRate, this.colony.expandRate);
            if(expandNumber < (this.cultureExpandRate + this.colony.expandRate)){
                //console.log("TRUE");
                return true;
            }else{
                console.log("false");
                return false;
            }
        }else{
            return false;
        }
    }


    reinforceTroops(){
        if (this.colony.reserveTroops > 1 && this.colony.prevInCombatTiles > 0 ){
            //console.log(`${this.colony.} || ${Math.ceil(this.colony.reserveTroops/this.colony.totalTiles)} `);
            // console.log(`Total Tiles: ${this.colony.prevTotalTiles}`);
            // console.log(`${this.colony.reserveTroops} - ${Math.ceil(this.colony.reserveTroops/this.colony.prevTotalTiles)} ||  ${this.troop.troopCount} + ${Math.ceil(this.colony.reserveTroops/this.colony.prevTotalTiles)}`);
            this.troop.troopCount += Math.ceil(this.colony.reserveTroops/this.colony.prevInCombatTiles);
            this.colony.reserveTroops -= Math.ceil(this.colony.reserveTroops/this.colony.prevInCombatTiles);
            // console.log(this.colony.reserveTroops, this.troop.troopCount);
        }
    }
    
    getFractionOfReserveTroops(){
        if (this.colony.reserveTroops > 1){
            if(this.colony.prevInCombatTiles > 0){
                const troopNum = Math.ceil(this.colony.reserveTroops/this.colony.prevInCombatTiles);
                this.colony.reserveTroops -= troopNum;

                return troopNum;
            }else{
                const troopNum = Math.ceil(this.colony.reserveTroops/10);
                this.colony.reserveTroops -= troopNum;
                return troopNum;
            }
        }

        return 0;
    }
    popTurnDuties(thisTile, gameBoard){
        const birthNum = Math.floor(Math.random() * 1000);
        //checks if tile can grow pop (by random and tile capacity)
        if (birthNum > this.NUM_TO_POP_GROWTH && this.pop < this.tilePopCap){
            this.increasePopWithGrowth();
        }
        if (thisTile.tileType.inCombat){this.colony.totalInCombatTiles += 1;}
        
        //this.troopBarrack.sendManpowerToColony(this);
        this.trainTroop(thisTile);
        this.colony.currentShipBuild += .1;


        if (this.colonyControl < 1){
            this.colonyControl += .0002
        }
    }

    moveTroops(thisTile,gameBoard){
        //check if in combat
        var notMovingTroops = []
        if (thisTile.tileType.inCombat == false){
            //not in combat, so move
            var i = 0, len = this.troopList.length;
            //console.log("-=-=-=-");
            while (i < len) {
                var notMoveTroop = this.troopList[i].moveWithMovement(thisTile, gameBoard);
                if (notMoveTroop != null){
                    notMovingTroops.push(notMoveTroop);
                }
                i++
            }
            //empty troop array
            this.troopList = [...notMovingTroops];
        }else{
            if (this.troopList.length > 0){
                this.combineTroops();
                this.troopList[0].moveAcrossFrontline(thisTile, gameBoard)
            }            
        }
    }


    combineTroops(){
        var i = 0, len = this.troopList.length;
        if (this.troopList.length > 0){
            const firstTroop = this.troopList[0];
            var totalTroopCount = 0;
            while (i < len) {
                totalTroopCount += this.troopList[i].troopCount;
                i++
            }
            this.troopList = [];
            firstTroop.troopCount = totalTroopCount;
            this.troopList.push(firstTroop)
            
        }
    }

    /**
     * 
     * Conflict
     * 
     *  */ 

    attackEnemyTile(thisTile, defenderTile){

        const defenderPop = defenderTile.tileType.population;

        this.setLandTilesToBeInCombat(thisTile, defenderTile);

        //TODO make troops have more fighting power than militia
   

        //var outcome = Math.floor((this.getTroops() * thisTile.getCombinedAttack()) - (defenderPop.getTroops() * defenderTile.getCombinedDefense()));

        // console.log(defenderPop.getTroops());
        // console.log(defenderPop);
        const totalThisFighting = this.getTroops() + this.getMilitia();
        const totalDefenderFighting = defenderPop.getTroops() + defenderPop.getMilitia();

        var outcome = Math.floor((totalThisFighting * thisTile.getCombinedAttack() * this.troop.morale) 
        - (totalDefenderFighting * defenderTile.getCombinedDefense() * defenderPop.troop.morale));


        // console.log("====");
        // console.log(`${thisTile.y}, ${thisTile.x} | ${this.getTroops()} | ${this.getMilitia()}`)
        // console.log(`${defenderTile.y}, ${defenderTile.x} | ${defenderPop.getTroops()} | ${defenderPop.getMilitia()}`);
        // console.log(`Troops ${this.colony.teamId}: ${totalThisFighting} | Attack: ${thisTile.getCombinedAttack()} `);
        // console.log(`Troops ${defenderPop.colony.teamId}: ${totalDefenderFighting} | Defense: ${defenderTile.getCombinedDefense()} `);
        // console.log(`Outcome: ${outcome}`);

        // console.log(outcome);
        if (outcome >0){
            // Attackers won
            const troops = this.getTroops();
            const militia = this.getMilitia();

            const remainingFighting = Math.ceil(outcome/thisTile.getCombinedAttack())

            // console.log("WON");


            if (troops >= 1 && militia == 0){
                //only troops
                // console.log(`${this.troop.troopCount} = ${troops} - ${remainingFighting}`)
                this.troop.troopCount -= troops - remainingFighting;
            }else if (militia >= 1 && troops == 0){
                //only militia
                // console.log(`${this.pop} = ${militia} - ${remainingFighting}`)
                this.pop -= militia - remainingFighting;

            }else if (militia >= 1 && troops >= 1) {
                //both
                // console.log("BOTH LOSE");

                const troopRatio = troops/totalThisFighting;
                const militiaRatio = militia/totalThisFighting;

                const aliveTroops = Math.floor(remainingFighting*troopRatio);
                const aliveMilitia = Math.floor(remainingFighting*militiaRatio);

                // console.log(`${this.troop.troopCount} = ${troops} - ${aliveTroops}`)
                // console.log(`${this.pop} = ${militia} - ${aliveMilitia}`)


                this.troop.troopCount -= troops - aliveTroops;
                this.pop -= militia - aliveMilitia;
            }
            //TODO troops retreat
            defenderPop.pop -= defenderPop.getMilitia();
            this.wonBattleAsAttacker();
            defenderPop.lostBattleAsDefender();

            // console.log(`Attck Troops: ${this.troop.troopCount} | Pop: ${this.pop}`);

            return true;
        }else if (outcome == 0){
            //both die
            this.pop -= this.getMilitia();
            this.troop.troopCount = 0;

            defenderPop.pop -= defenderPop.getMilitia()
            defenderPop.troop.troopCount = 0;

            // console.log(`Attck Pop: ${this.pop} | Def Pop: ${defenderPop.pop}`);


            return false;
        }else{
            // Defenders/enemies Won 

            // make outcome positive
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
                // console.log("BOTH LOSE2");

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
            this.pop -= this.getMilitia();
            defenderPop.lostBattleAsDefender();
            return false;
        }
    } 


    retreat(thisTile){
        thisTile.tileType.checkIfInCombat()
    }

    migrateSomePopToTile(toTile){
        if (this.pop > this.POP_NEEDED_TO_MIGRATE){
            const popDonation = Math.floor(this.pop/this.MIGRATION_DIVIDER);
            toTile.tileType.population.pop += popDonation;
            this.pop -= popDonation;
        }
    }

    tranferStatsFromAttackerTile(thisTile, oldPop){
        //TODO mixing of culture values,, use this function for now
    
        //  create a new troop with troops from old tile 
        this.troop = new Troop(Math.floor(oldPop.troop.troopCount/2), oldPop.colony, oldPop.troop.attack, oldPop.troop.defense);
        oldPop.troop.troopCount -= Math.floor(oldPop.troop.troopCount/2);

        if (this.pop < 2 && oldPop.pop > 2){
            const donatedPop = Math.ceil(oldPop.pop/this.MIGRATION_DIVIDER);
            this.pop += donatedPop;
            oldPop.pop -= donatedPop; 
        }
        this.colony = oldPop.colony;
        thisTile.toDraw = true;
        thisTile.isEmpty = false;
        thisTile.isNew = true;

        //check if same culture
        if (this.cultureName === oldPop.colony.teamId){
            this.colonyControl = 1;
        }else{
            this.colonyControl = .01;
        }

        this.colony.increaseNewTilesByOne();
    }

    setLandTilesToBeInCombat(thisTile, otherTile){
        thisTile.tileType.inCombat = true;
        otherTile.tileType.inCombat = true;
    }

    attemptMutateCulture(){
        //TODO fix attack mutation
        // TODO smaybe share with friendly nieghbhor (like migration)

        var rand = Math.random()*1000
        if (rand < 2){ // 2/10000
            this.cultureAttack+= .001;//this.INCREASE_ATTACK_DEFENSE_MUTATE;
        }else if (rand<7){ // 7/10000
            this.cultureDefense += .001;//this.INCREASE_ATTACK_DEFENSE_MUTATE;
        }else if (rand <7){ // 10
            if (this.culturePopGrowth<this.POP_GROWTH_LIMIT){
                this.culturePopGrowth += 0;
            }
        }else if (rand < 14){ // 10
            this.tilePopCap +=5;
        }else if (rand  < 15){
            this.colony.attack+=.0005;
        }else if (rand  < 16){
            this.colony.defense+=0.0005;
        }else if (rand < 17){
            this.colony.activeNavalCap +=.001;
        }else if (rand < 22){
            this.colony.milStrength += .001 * this.colonyControl;
        }
    }

    /// Stats ///
    getMilitia(){
        //TODO make control affect population
        return Math.floor(.01 * this.pop * this.colonyControl);
    }

    getTroops(){
        return this.troop.troopCount
    }

    getCombinedRecruitPerc(){
        const recruitPerc = this.cultureRecruitPerc + this.colony.recruitPerc;
        if (recruitPerc > 90){
            return 90
        }else {
            return recruitPerc;
        }
    }

    lostBattleAsAttacker(){
        if (this.cultureAttack - this.DECREASE_ATTACK_AFTER_LOSS > this.MIN_ATTACK_AND_DEFENSE){
            this.cultureAttack -= this.DECREASE_ATTACK_AFTER_LOSS;
        }
    }
    lostBattleAsDefender(){
        if (this.cultureDefense - this.DECREASE_DEFENSE_AFTER_LOSS > this.MIN_ATTACK_AND_DEFENSE){
            this.cultureDefense -= this.DECREASE_DEFENSE_AFTER_LOSS;
        }
        if (this.tilePopCap-10 > 1){
            this.tilePopCap -= 1;
        }
    }

    wonBattleAsDefender(){
        this.cultureDefense += this.INCREASE_DEFENSE_AFTER_VICTORY;
    }

    wonBattleAsAttacker(){
        this.cultureAttack += this.INCREASE_ATTACK_AFTER_VICTORY;

    }

    increasePopWithGrowth(){        
        //Logistic Way:
        this.pop += (.1 * (1 - this.pop / this.tilePopCap) * this.pop);
    }

    checkIfStatsAreNewColonyMax(thisTile){
        if (this.pop > this.colony.maxPop){
            this.colony.maxPop = this.pop;
        }
        if (thisTile.getCombinedAttack() > this.colony.maxAttack){
            this.colony.maxAttack = thisTile.getCombinedAttack();
        }  
        if(thisTile.getCombinedDefense() > this.colony.maxDefense){
            this.colony.maxDefense = thisTile.getCombinedDefense();
        }
        
    }

    updateColonyDisplayStats(thisTile){
        // this.colony.totalAttack += this.cultureAttack + this.colony.attack;
        // this.colony.totalDefense += this.cultureDefense + this.colony.defense;
        this.colony.totalAttack += thisTile.getCombinedAttack();
        this.colony.totalDefense += thisTile.getCombinedDefense();
        this.colony.totalManpower += this.getManpower();

        this.colony.totalTiles ++;
        this.colony.totalPop += this.pop;
        this.colony.totalTroops += this.troop.troopCount;
    }

    decreasePop(amountToDecreaseBy){
        this.pop -= amountToDecreaseBy;
    }

    setPop(pop){
        this.pop = pop;
    }

    getCombinedPopulationAttack(){
        return (this.colony.milStrength + this.cultureAttack + this.colony.attack)
    }


    emptyTile(thisTile){
        //console.log(thisTile);

        thisTile.isEmpty = true;
        thisTile.toDraw = true;
        thisTile.isNew = true;
        thisTile.isOccupiedLand = false;
        this.pop = 0;
        

        //console.log("Making:" ,thisTile.x, thisTile.y , " Ship null")

    }

    pickARandomNESWTile(x, y, GAME_BOARD){
        const direction = Math.floor(Math.random()*4);
            
        //TODO check for wrap around
        if(x-1 >= 0 && x+1 < GAME_BOARD[0].length && y-1 >= 0 && y+1 < GAME_BOARD.length){
            if (direction == 0){
                //N
                return GAME_BOARD[y-1][x]
            }else if(direction == 1){
                //E
                return GAME_BOARD[y][x+1]
            }else if(direction == 2){
                //S
                return GAME_BOARD[y+1][x]
            }else if(direction == 3){
                //W
                return GAME_BOARD[y][x-1]
            }
            else{return null}
        }
    }
    // requests
    combatTroopRequestsMain(thisTile, GAME_BOARD){
        
        //check if this has a request to tile
        if (this.requestedTroopsTo == null){
            var newReqTroopsTo = this.pickARandomNESWTile(thisTile.x, thisTile.y, GAME_BOARD);
            if (newReqTroopsTo == null){
                return;
            }
            if (newReqTroopsTo.tileType instanceof LandTile && newReqTroopsTo.isEmpty == false){

                if (newReqTroopsTo.tileType.population.colony.teamId === this.colony.teamId && newReqTroopsTo.tileType.population.newReqTroopsFrom != null){
                    if (this.distanceFromCombat < newReqTroopsTo.tileType.population.distanceFromCombat){
                        //newReqTroopsTo.tileType.population.newReqTroopsFrom.toDraw = true;
                        newReqTroopsTo.tileType.population.newReqTroopsFrom = null;
                        this.requestedTroopsTo = newReqTroopsTo;
                        //thisTile.toDraw = true;
                        newReqTroopsTo.toDraw = true;
                    }
                }else{
                    this.requestedTroopsTo = newReqTroopsTo;
                    //thisTile.toDraw = true;
                    newReqTroopsTo.toDraw = true;

                }
            }

        }// else do nothing
    }


    getManpower(){
        //console.log(this.colony.colonyRecruitPerc * this.pop * this.colonyControl);
        return this.colony.colonyRecruitPerc * this.pop * this.colonyControl;
    }
    
    createNewTroop(amount){
        if (this.getManpower() > amount){
            // console.log(`Amount: ${amount}, Reserve troops${this.colony.reserveTroops}`);

            this.colony.reserveTroops += amount;
            this.pop -= amount
        }
    }


}
