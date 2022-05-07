export default class colony{
    SELECTOR;

    totalPop = 0;
    totalAttack = 0;
    totalTiles = 0;
    totalDefense = 0;
    totalTroops = 0;
    totalInCombatTiles = 0;
    totalManpower = 0;

    newTiles = 0; // TODO implement new tile to check if colony is dead still need to delete ships (maybe not)

    maxPop = 0;
    maxAttack = 0;
    maxDefense = 0;
    maxStength = 0;

    prevMaxPop = 0;
    prevMaxAttack = 0;
    prevMaxDefense = 0;
    prevTotalTiles = 0;
    prevInCombatTiles = 0;

    tileCapacity = 900;
    //troops
    reserveTroops = 0;
    milStrength;

    // naval
    activeNavalCap = 20; // 50
    currentActiveShips = 0;
    currentShipBuild = 0
    shipProductionCost = 1000; //1000

    // HTML
    overlayButton;

    //reserve
    isDead = false;

    constructor(teamId, color, selector){
        //String id
        this.teamId = teamId;
        //String Hexadecimal color
        this.color = color;
        this.SELECTOR = selector;
        //console.log(this.SELECTOR);
    }

    /**
     * 
     * @param {double} attack 
     * @param {double} defense 
     * @param {int} expandRate 
     * @param {double} recruitPerc 
     * @param {double} popGrowth 
     */
    setColonyStats(attack, defense, recruitPerc, popGrowth, expandRate, milStrength){
        this.attack = attack;
        this.defense = defense;
        this.expandRate = expandRate;
        this.colonyRecruitPerc = recruitPerc;
        this.popGrowth = popGrowth;
        this.milStrength = milStrength;

    }

    resetTotalDisplayStats(){
        this.totalPop = 0;
        this.totalAttack = 0;
        this.totalDefense = 0;
        this.totalTiles = 0;
        this.totalTroops = 0;
        this.totalInCombatTiles = 0;
        this.totalManpower = 0;

        this.maxPop = 0;
        this.newTiles = 0

    }

    // resets stats used for displaying map mode colors
    resetMaxStats(){
        this.maxAttack = 0;
        this.maxDefense = 0;
        this.maxPop = 0;
    }

    returnStatsToString(){
        //return (this.teamId + " | Tiles: " + this.totalTiles + " | Pop: " + this.totalPop + " | Avg Attack: " + Math.ceil(this.totalAttack/this.totalTiles) + " | Avg Defense: " + Math.ceil(this.totalDefense/this.totalTiles) + " | maxPop: " + this.maxPop + " | ") + this.tileCapacity;  
        return `${this.teamId}: Tiles: ${this.totalTiles} | Pop: ${Math.trunc(this.totalPop + this.totalTroops + this.reserveTroops)} |  Avg Strength: ${Math.ceil(this.milStrength)} 
        | Total Troops: ${Math.trunc(this.totalTroops)} Reserve/ManPower: ${Math.trunc(this.reserveTroops)}/${Math.trunc(this.totalManpower)} | Ships: ${this.currentActiveShips}`;
    }

    increaseNewTilesByOne(){
        this.newTiles ++;
    }
    

    setCurrentMaxToPrevMax(){
        this.prevMaxAttack = this.maxAttack;
        this.prevMaxDefense = this.maxDefense;
        this.prevMaxPop = this.maxPop;
        this.prevTotalTiles = this.totalTiles;
        this.prevInCombatTiles = this.totalInCombatTiles;
    }

    createNewStatDisplay(){
        this.display = document.createElement("h3");

        this.display.style.color = this.color;
        this.node = document.createTextNode(this.returnStatsToString());
        this.display.appendChild(this.node);
        this.element = document.getElementById("stat_holder")
        this.element.appendChild(this.display);
    }

    removeOldStatDisplay(){
        document.getElementById(this.teamId).remove();
    }

  displayStats(){
      //console.log("TOTAL TILES:", this.totalTiles);
      if (this.isDead){
        //this.element.parentNode.removeChild(this.element);
      }else{
        this.node.nodeValue = this.returnStatsToString();
      }
    }

  

  checkDead(){
      if (this.totalTiles <= 0){
          this.isDead = true;
          console.log(this.teamId,"IsDead");
          return true;
      }else{
          return false;
      }
  }

  createNewOverlayButton(){
    this.overlayButton = document.createElement("Button")
    document.getElementById("overlay_buttons").appendChild(this.overlayButton);
    this.overlayButton.innerText = this.teamId;
    //console.log(this.SELECTOR);
    this.overlayButton.onclick = () => {
        this.SELECTOR.selectorType = "draw_colony";
        this.SELECTOR.selectedColony = this;
    }
    

    // TODO set selector colony to this colony when clicked
  }

  hasTiles(){
      return (this.totalTiles > 0);
  }


  

}
