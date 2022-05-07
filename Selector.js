export default class Selector{

    selectorType;
    selectedColony;
    selectedTile;

    showSelectColonyOverlay = false;

    listOfTerrainEdits = ["mountain", "plain", "river", "forest"]; // keepts track of what types of terrain can be editied


    constructor(){
        this.selectorType = "NONE"
    }




}
