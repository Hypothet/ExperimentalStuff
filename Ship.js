export default class Ship{

    health;
    strength;
    
    constructor(population){
        this.population = population;
    }


    // set ship values to colonies
    setShipValuesFromColony(){
        //TODO setup colony for this,, using static for now
        this.health = 200;
        this.strength = 10;
    }

    


    checkIfSunk(){
        return this.health <= 0;
    }
}
