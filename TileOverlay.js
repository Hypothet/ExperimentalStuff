import LandTile from "./LandTile.js"
import Overlay from "./overlays/Overlay.js";

export default class TileOverlay extends Overlay{
    constructor(overlay){
        super(overlay)
        this.addCloseButton();

    }
//TODO fix land tile not importing
    displayTileOverlay(tile){
        this.hideDisplayDivs();

        if (tile.tileType instanceof LandTile){
            if (tile.isEmpty){
                this.displayEmptyLandTile(tile);
            }else{
                this.displayColonizedTile(tile);
            }
        }else{
            // water tile
            if (tile.isEmpty){
                this.displayEmptyWaterTile(tile);
            }else{
                this.displayOccupiedWaterTile(tile);
            }
        }

        this.showOverlay();

    }

    displayOccupiedWaterTile(tile){
        const tilePop = tile.tileType.ship.population;
        // console.log(tile);
        document.getElementById("tile_overlay_occupied_water_colony_name").innerHTML = tilePop.colony.teamId;
        document.getElementById("tile_overlay_occupied_water_pop_text").innerHTML = `Population: ${Math.floor(tilePop.pop)} | Cap: ${Math.floor(tilePop.tilePopCap)}`;
        document.getElementById("tile_overlay_occupied_water_troop_text").innerHTML = `Troops: ${Math.floor(tilePop.troop.troopCount)}`;
        document.getElementById("tile_overlay_occupied_water_strength_and_health_text").innerHTML = `Strength: ${Math.floor(tile.tileType.ship.strength)} | Health: ${Math.floor(tile.tileType.ship.strength)}`;

        document.getElementById("tile_overlay_for_occupied_water").style.display = "block";
    }

    displayEmptyWaterTile(tile){
        document.getElementById("tile_overlay_empty_water_header").innerHTML = "Silent Ocean";
        document.getElementById("tile_overlay_empty_water_pop_text").innerHTML = "Pop: Just a few Fishies"

        document.getElementById("tile_overlay_for_empty_water").style.display = "block";

    }
    displayColonizedTile(tile){
        const tilePop = tile.tileType.population;

        document.getElementById("tile_overlay_colony_name").innerHTML = tilePop.colony.teamId;
        document.getElementById("tile_overlay_pop_text").innerHTML = `Population: ${Math.floor(tilePop.pop)} | Housing: ${Math.floor(tilePop.tilePopCap)}`;
        document.getElementById("tile_overlay_troop_text").innerHTML = `Troops: ${Math.floor(tilePop.troop.troopCount)}`;
        document.getElementById("tile_overlay_attack_and_defense_text").innerHTML = `Attack: ${Math.floor(tile.getCombinedAttack())} | Defense: ${Math.floor(tile.getCombinedDefense())}`;
        document.getElementById("tile_overlay_colony_control_text").innerHTML = `Colony Control: ${(Math.ceil(tilePop.colonyControl*100)/100)}`;

        
        document.getElementById("tile_overlay_for_occupied_land").style.display = "block";
    }
    displayEmptyLandTile(tile){        
        // console.log(tile);
        const tilePop = tile.tileType.population;

        document.getElementById("tile_overlay_terrain_name").innerHTML = "Uncolonized Land"

        document.getElementById("tile_overlay_empty_land_pop_text").innerHTML = `Population: ${Math.floor(tilePop.pop)} | Cap: ${Math.floor(tilePop.tilePopCap)}`;
        document.getElementById("tile_overlay_empty_land_troop_text").innerHTML = `Troops: ${Math.floor(tilePop.troop.troopCount)}`;


        document.getElementById("tile_overlay_for_empty_land").style.display = "block";        

    }


    addCloseButton(){
        this.overlayButton = document.getElementById("tile_overlay_close_btn")

        this.overlayButton.onclick = () => {
            this.hideOverlay();
        }
    }

    hideDisplayDivs(){
        document.getElementById("tile_overlay_for_occupied_land").style.display = "none";
        document.getElementById("tile_overlay_for_occupied_water").style.display = "none";        
        document.getElementById("tile_overlay_for_empty_land").style.display = "none";        
        document.getElementById("tile_overlay_for_empty_water").style.display = "none";        

    }

}
