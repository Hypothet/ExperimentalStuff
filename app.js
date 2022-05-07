import { default as Tile } from "./Tile.js";
import { default as Colony } from "./Colony.js";
import { default as Population } from "./Population.js";
import { default as Selector } from "./Selector.js";
import { default as NameParts } from "./NameParts.js";


import { default as TileOverlay } from "./TileOverlay.js";


import { default as Water } from "../terrainTiles/Water.js";
import { default as ForestTile } from "../terrainTiles/ForestTile.js";
import { default as MountainTile} from "../terrainTiles/MountainTile.js";
import { default as RiverTile} from "../terrainTiles/RiverTile.js";
import { default as PlainTile} from "../terrainTiles/PlainTile.js";

import { default as WaterTile} from "./WaterTile.js";
import { default as LandTile } from "./LandTile.js";
import Troop from "./Troop.js";


//TODO finsih implementing map modes
//TODO colont current active ships not accurate
//TODO create a class holding game values, like maxRandomColonyPop
//TODO Make colonys hold troops and place on border

var UPDATE_TIME = 10; // 10

var GAME_BOARD = [];
var RAW_BOARD = [];
var SHUFFLED_GAME_BOARD = [];

var WRAP_BOARD_OPT = false;


var SIZE = 2;

var IMAGE_WIDTH;
var IMAGE_HEIGHT;

var BOARD_WIDTH = Math.floor(900/SIZE);
var BOARD_HEIGHT = Math.floor(600/SIZE);

var RUN_GAME = false;
var UPDATE_RAW_BOARD = true;

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");

var COLONY_ARRAY = [];
var COLONY_COUNT;

/// Edit Map Variables
var SHOW_EDIT_TERRAIN_BUTTONS = true;
var SELECTOR = new Selector();
var EDIT_BRUSH_SIZE = 3;

const MOUNTAIN_TILE = new MountainTile();
const PLAIN_TILE = new PlainTile();
const RIVER_TILE = new RiverTile();
const FOREST_TILE = new ForestTile();

const WATER_TILE = new Water();

var STEPS = 0;

const BASE_POP = 100;
const BASE_ATTACK = 1.0; // double attack Modifier 
const BASE_DEFENSE = 1.0; // double Defense mod
const BASE_RECRUIT_PERC = .015; //double percent of recruited troops
const BASE_POP_GROWTH = 0.04; // double
const BASE_EXPAND_RATE = 100; // int
const BASE_MIL_STRENGTH = 5;
const LARGER_POP_DIVIDER_NEEDED_TO_SEND_MIGRANTS = 2; //

var MAP_DISPLAY_STYLE = "political"; // political, geo, pop, strength, 
var maxStartingPop = 50;


//Overlay variables
var TILE_OVERLAY = new TileOverlay(document.getElementById("tile_overlay"));
TILE_OVERLAY.hideOverlay();
var INITIAL_CLICK = true;

//TODO RandomPopulations


/// editing map variables
var DRAW_EDIT_ON_MAP = false; 


function startGame(){
    
    addPauseButton();
    createMainImageInput();
    //addMapImportInput()
    addDisplayMapButton();
    //addChangeMapModeButton();
    addNumberOfColniesButton();
    addPrintGameBoard();
    addMapModeButtons();
    addEditTerrainButtons();
    addEditIndividualTerrainButtons();
    addSelectButton();
    addPlaceAndDrawCustomColonyButton();
    addViewUpcomingUpdates();
    //addSaveMapButton();

    addSpeedSlider();
    addEditBrushSlider();

    createStartingMap();

    ctx.stroke();

    //ctx.drawImage("./img/work")
//TODO Have map at beginning

}

function createStartingMap(){
    UPDATE_RAW_BOARD = true;
    const image = new Image();
    image.src = "./img/worldMap.png";
    image.onload = () => {
        IMAGE_WIDTH = image.width;
        IMAGE_HEIGHT = image.height;

        BOARD_HEIGHT = Math.floor(IMAGE_HEIGHT);
        BOARD_WIDTH = Math.floor(IMAGE_WIDTH);
        c.width = Math.floor(IMAGE_WIDTH);
        c.height = Math.floor(IMAGE_HEIGHT);

        ctx.drawImage(image,0,0);

    }
}

function createMainImageInput(){
    const imageInput = document.querySelector("#main_image_input");
    var uploadedImage = "";

    imageInput.addEventListener("change", function(){
        const reader = new FileReader();
        
        // gets the image's width and height and changes canvas and board sizes
        reader.onload = (theFile) => {
            // console.log(theFile);
            UPDATE_RAW_BOARD = true;
            const image = new Image();
            image.src = theFile.target.result;
            image.onload = () => {
              IMAGE_WIDTH = image.width;
              IMAGE_HEIGHT = image.height;

              BOARD_HEIGHT = Math.floor(IMAGE_HEIGHT);
              BOARD_WIDTH = Math.floor(IMAGE_WIDTH);
              c.width = Math.floor(IMAGE_WIDTH);
              c.height = Math.floor(IMAGE_HEIGHT);

              ctx.drawImage(image,0,0);
              
            };
          };


        // sets image as background
        reader.addEventListener("load", ()=>{ 
            
        })
        reader.readAsDataURL(this.files[0]);
    });
    //console.log("Convert")
}

function addMapImportInput(){
    document.getElementById('map_import_input').onchange = function(evt) {
        try {
            let files = evt.target.files;
            if (!files.length) {
                alert('No file selected!');
                return;
            }
            let file = files[0];
            let reader = new FileReader();
            const self = this;
            reader.onload = (event) => {
                console.log('FILE CONTENT', JSON.parse(event.target.result));
                convertJsonToGameBoard(JSON.parse(event.target.result));
                drawAllTiles();
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
        }
    }   
}

function convertJsonToGameBoard(jCont){
    GAME_BOARD = []
    var tempRow = []
    var newTile;
    var jElem;

    for (let row = 0; row < jCont.length; row+=1){
        tempRow = [];
        for(let col = 0; col<jCont[0].length ; col+=1){
            
            tempRow.push(newTile)
        }
        GAME_BOARD.push(tempRow);
    }
    console.log(GAME_BOARD);
}

function ConvertJsonElementForGameBoardMain(JElem){
    console.log(jCont[row][col]);
    jElem = jCont[row][col];
    newTile =  new Tile(jElem.x,jElem.y, jElem.size)
    newTile.tileType = new LandTile(PLAIN_TILE);
    
    console.log(newTile); 
}

/**
 * reads the current state of the canvas and converts it to a 2d array 
 */
function convertCanvasTo2dArray(size=SIZE){
    var mapArray = [];
    var tempRow;
    var tempTile;
    var tileColor;

    drawAllTiles();

    for (let row = 0; row < BOARD_HEIGHT; row+=1){
        tempRow = [];
        for(let col = 0; col<BOARD_WIDTH; col+=1){
            tileColor = ctx.getImageData(col*size, row*size, size, size);
            //console.log(col, row);
            tempTile = new Tile(col, row, size);
            tempTile.toDraw = true;

            //console.log(tileColor.data[0],tileColor.data[1],tileColor.data[2])

            //tile is white
            if (tileColor.data[0] > 200 && tileColor.data[1] > 200 && tileColor.data[2] > 200){
                tempTile.tileType = WATER_TILE;

            }else{                
                // tile is green
                tempTile.tileType = PLAIN_TILE;
            }

            tempRow.push(tempTile);
        }
        mapArray.push(tempRow);
    }

    return mapArray;

}

// converts the raw board to a new board with proper sized tiles
function create2DArrayFromRawBoard(size){
    dArray = [];
    var height = GAME_BOARD.length();
    var width = GAME_BOARD[0].length();

    for (let row = 0; row < Math.floor(height/size); row+=1){
        tempRow = [];
        for(let col = 0; col<Math.floor(width/size); col+=1){


        }
    }
    return dArray;
}

/**
 *  Downloads the canvas to users computer
 */ 
function downloadCanvasAsPNG(fileName){
    // allows user to view and save image (imageConverted is an id of a img tag on html)
    // const dataURI = c.toDataURL();
    // imageConverted.src = dataURI;

    //allows user to download image

    // for IE and Edge Only
    if(window.navigator.msSaveBlob){
        window.navigator.msSaveBlob(c.msToBlob(), fileName);
    }else{
        // for all other browsers
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.href = c.toDataURL();
        a.download = fileName;

        a.click();
        document.body.removeChild(a);
    }
}

function printBoard(){
    var tempTile;
    console.log("STARTING PRINTBOARD");

    for (let row = 0; row < BOARD_HEIGHT; row+=1){
        console.log("===NEW LINE===")
        for(let col = 0; col<BOARD_WIDTH; col+=1){
            tempTile = GAME_BOARD[row][col]
            tempTile.print();
        }
        
    }

    console.log("++++ END ++++")


}

/**
 * 
 * Saving
 * 
**/
function downloadEntireMapWithJson(content, fileName="ColonySimIoMap.txt", contentType="text/plain") {

    var a = document.createElement('a')
    var blob = new Blob([content], {type: contentType})
    var url = URL.createObjectURL(blob)
    a.setAttribute('href', url)
    a.setAttribute('download', fileName)
    a.click()

}




/**
 * 
 * EDITING MAP
 * 
 **/ 
function handleMouseDown(e) {
    DRAW_EDIT_ON_MAP = true;
    drawEditOnMapMain(e);
    INITIAL_CLICK = true;
}
function handleMouseUp(e) {
    DRAW_EDIT_ON_MAP = false;
    INITIAL_CLICK = true;
}
function handleMouseMove(e) {
    if (DRAW_EDIT_ON_MAP){
        // console.log(INITIAL_CLICK);
        // console.log("MOVE");


        if (INITIAL_CLICK){
            INITIAL_CLICK = false;
        }
        else{
            drawEditOnMapMain(e);
        }
    }
     
}
/// Interacting With Map ///
function drawEditOnMapMain(e){
    var mousePos = getMousePosition(c, e);
    const clickedTile = GAME_BOARD[Math.floor(mousePos.y/SIZE)][Math.floor(mousePos.x/SIZE)]

    if (SELECTOR.selectorType === "select"){
        selectorSelectedMain(clickedTile);
    }
    else if (SELECTOR.listOfTerrainEdits.includes(SELECTOR.selectorType)){

        if (clickedTile.tileType instanceof LandTile){
            editMapWithSelectedTerrain(clickedTile);  
        }
    }else if (SELECTOR.selectorType === "place_colony"){
        placeCustomColonyMain(clickedTile);
    }else if (SELECTOR.selectorType === "draw_colony"){
        drawColonyBordersMain(clickedTile);
    }else if(SELECTOR.selectorType === "ocean"){
        editMapWithOcean(clickedTile);
    }
}

function editMapWithOcean(tile){
    const gameBoardHeight = GAME_BOARD.length;
    const gameBoardWidth = GAME_BOARD[0].length;
    var tempTile;    
    ctx.fillStyle = WATER_TILE.color;

    tile.tileType = new WaterTile(WATER_TILE);
    tile.isEmpty = true;
    tile.toDraw = true;
    tile.isNew = false;
    tile.isOccupiedLand = false;

    ctx.fillRect(tile.getDrawX(),tile.getDrawY(), tile.getDrawSize(), tile.getDrawSize());
    //console.log(EDIT_BRUSH_SIZE)
    for (let row = tile.y - EDIT_BRUSH_SIZE +1; row < tile.y + EDIT_BRUSH_SIZE -1; row ++ ){
        for (let col = tile.x - EDIT_BRUSH_SIZE +1; col < tile.x + EDIT_BRUSH_SIZE -1; col ++ ){
            if (row >= 0 && row < gameBoardHeight && col >=0 && col < gameBoardWidth){

                tempTile = GAME_BOARD[row][col];
                if (tempTile.tileType instanceof LandTile){
                    tempTile.tileType = new WaterTile(WATER_TILE)
                    //TODO decrease ship count if there was a ship
                    tempTile.isEmpty = true;
                    tempTile.toDraw = true;
                    tempTile.isNew = false;
                    tempTile.isOccupiedLand = false;

                    ctx.fillRect(tempTile.getDrawX(),tempTile.getDrawY(), tempTile.getDrawSize(), tempTile.getDrawSize());
                }
            }

        }
    }

}

function selectorSelectedMain(tile){
    // console.log(stringify);
    // console.log(JSON.parse(stringify));
    // console.log(tile);
    TILE_OVERLAY.displayTileOverlay(tile)
    //console.log(tile.constructor.name);
}


function editMapWithSelectedTerrain(tile){
    //console.log(Math.floor(mousePos.y/SIZE), Math.floor(mousePos.x/SIZE), SIZE);
    addTerrainToSelectedTiles(tile)
}

function addTerrainToSelectedTiles(tile){
    const terrainType = getSelectedTerrainObject()
    ctx.fillStyle = terrainType.color;
    var tempTile;
    const gameBoardHeight = GAME_BOARD.length;
    const gameBoardWidth = GAME_BOARD[0].length;

    tile.tileType.terrain = terrainType;
    ctx.fillRect(tile.getDrawX(),tile.getDrawY(), tile.getDrawSize(), tile.getDrawSize());
    //console.log(EDIT_BRUSH_SIZE)
    for (let row = tile.y - EDIT_BRUSH_SIZE +1; row < tile.y + EDIT_BRUSH_SIZE -1; row ++ ){
        for (let col = tile.x - EDIT_BRUSH_SIZE +1; col < tile.x + EDIT_BRUSH_SIZE -1; col ++ ){
            if (row >= 0 && row < gameBoardHeight && col >=0 && col < gameBoardWidth){

                tempTile = GAME_BOARD[row][col];
                if (tempTile.tileType instanceof LandTile){
                    tempTile.tileType.terrain = terrainType;
                    ctx.fillRect(tempTile.getDrawX(),tempTile.getDrawY(), tempTile.getDrawSize(), tempTile.getDrawSize());
                }
            }

        }
    }


}

function getSelectedTerrainObject(){
    switch(SELECTOR.selectorType){
        case "plain":
            return PLAIN_TILE;
            break;
        case "mountain":
            return MOUNTAIN_TILE;
            break;
        case "forest":
            return FOREST_TILE;
            break;
        case "river":
            return RIVER_TILE
            break
    }

}

function getMousePosition(c, e) {
   var boundary = c.getBoundingClientRect();
    // (e.clientX, e.clientY)  => Mouse coordinates wrt whole browser
    //  (boundary.left, boundary.top) => Canvas starting coordinate
    //     console.log(e.clientX - boundary.left, e.clientY - boundary.top);
     return {
        x: e.clientX - boundary.left,  
        y: e.clientY - boundary.top
      };
}

function placeCustomColonyMain(tile){

    const newColony = createNewColonyWithStats(document.getElementById("custom_colony_name_input").value,
    document.getElementById("custom_colony_color_input").value,
    
    BASE_ATTACK, BASE_DEFENSE,
    // parseInt(document.getElementById("custom_colony_attack_input").value),
    // parseInt(document.getElementById("custom_colony_defense_input").value),
    BASE_RECRUIT_PERC, BASE_POP_GROWTH, BASE_EXPAND_RATE,
    parseInt(document.getElementById("custom_colony_strength_input").value));

    newColony.reserveTroops = parseInt(document.getElementById("custom_colony_troops_input").value);
    COLONY_ARRAY.push(newColony);

    placeCustomColonyOnBoard(tile, newColony, parseInt(document.getElementById("custom_colony_capital_population_input").value));
    //TODO make sure clicked tile is land
    tile.tileType.population.tilePopCap = parseInt(document.getElementById("custom_colony_capital_population_input").value);
    drawTile(tile)

    newColony.createNewStatDisplay();
    newColony.createNewOverlayButton();

    SELECTOR.selectorType = "NONE";

}

function drawColonyBordersMain(tile){
    const gameBoardHeight = GAME_BOARD.length;
    const gameBoardWidth = GAME_BOARD[0].length;
    var tempTile
    for (let row = tile.y - EDIT_BRUSH_SIZE +1; row < tile.y + EDIT_BRUSH_SIZE -1; row ++ ){
        for (let col = tile.x - EDIT_BRUSH_SIZE +1; col < tile.x + EDIT_BRUSH_SIZE -1; col ++ ){
            if (row >= 0 && row < gameBoardHeight && col >=0 && col < gameBoardWidth){

                tempTile = GAME_BOARD[row][col];
                if (tempTile.tileType instanceof LandTile){

                    tempTile.tileType.population.setStatsForInitialPlacement(tempTile, SELECTOR.selectedColony, 1)

                    drawTile(tempTile);
                }
            }
        }

    }
}

//TODO find a place for this (startGame()?)
c.addEventListener('mousemove', handleMouseMove, false);
c.addEventListener('mousedown', handleMouseDown, false);
c.addEventListener('mouseup', handleMouseUp, false);   

/**
 * 
 * Math 
 * 
 */


function createRawBoard(){
    var mapArray = [];
    var tempRow;
    var tempTile;
    var tileColor;
    
    for (let row = 0; row < BOARD_HEIGHT; row+=1){
        tempRow = [];
        for(let col = 0; col<BOARD_WIDTH; col+=1){
            tileColor = ctx.getImageData(col, row, 1, 1);

            tempTile = new Tile(col, row, 1);
            tempTile.toDraw = true;


            
            if (tileColor.data[0] > 200 && tileColor.data[1] > 200 && tileColor.data[2] > 200){
                //tile is water
                tempTile.tileType = new WaterTile(WATER_TILE);
            }else{                
                // tile is land (plain)
                tempTile.tileType = new LandTile(PLAIN_TILE);
                tempTile.tileType.setPopulation(new Population(BASE_POP, null))
            }

            tempRow.push(tempTile);
        }
        mapArray.push(tempRow);
    }
    //console.log(BOARD_WIDTH, BOARD_HEIGHT)
    //console.log(mapArray.length);
    return mapArray;
}

function drawTile(tile){
    var tilePop = tile.tileType.population;
    //console.log(MAP_DISPLAY_STYLE);
    
    if (MAP_DISPLAY_STYLE === "political" && tile.isEmpty == false){
        //TODO TEMPARARY
        //console.log("DRAWING");
        if (tile.isOccupiedLand){
            ctx.fillStyle = tilePop.colony.color;
        }else{
            ctx.fillStyle = tile.tileType.ship.population.colony.color;
        }
        

    }
    else if (MAP_DISPLAY_STYLE === "geo"){
        ctx.fillStyle = tile.tileType.terrain.color;
    }else if (MAP_DISPLAY_STYLE === "pop" && tile.isEmpty == false){
        const maxPop = findMaxPopFromColonies();
        // convert to color and color tile
        if (tile.tileType.terrain.name === "water" ){
            ctx.fillStyle = "#" + toHex(Math.floor(255-(255*tile.tileType.ship.population.pop/maxPop))) + toHex(Math.floor(255-(255*tile.tileType.ship.population.pop/maxPop))) + "FF";    
        }else{
            ctx.fillStyle = "#" + toHex(Math.floor(255-(255*tilePop.pop/maxPop))) + toHex(Math.floor(255-(255*tilePop.pop/maxPop))) + "FF";    
        }
          
    }else if (MAP_DISPLAY_STYLE === "attack" && tile.isEmpty == false){
        const maxAttack = findMaxAttackFromColonies();

        if (tile.tileType.terrain.name === "water" ){
            // naval strength -- since water
            //TODO get max ship strength
            ctx.fillStyle = "#FF" + toHex(Math.floor(255-(255*tile.tileType.ship.strength/maxAttack))) + toHex(Math.floor(255-(255*tile.tileType.ship.strength/maxAttack)));    
        }else{
            ctx.fillStyle = "#FF" + toHex(Math.floor(255-(255*tile.getCombinedAttack()/maxAttack))) + toHex(Math.floor(255-(255*tile.getCombinedAttack()/maxAttack)));    
        }

    }
    else if (MAP_DISPLAY_STYLE === "defense" && tile.isEmpty == false){
        const maxDefense = findMaxDefenseFromColonies();

        if (tile.tileType.terrain.name === "water" ){
            // naval health -- since water
            //TODO get max ship health
            ctx.fillStyle = "#FF" + toHex(Math.floor(255-(255*tile.tileType.ship.health/maxDefense))) + "FF";    
        }else{
            ctx.fillStyle = "#FF" + toHex(Math.floor(255-(255*tile.getCombinedDefense()/maxDefense))) + "FF";    
        }

    }else if(MAP_DISPLAY_STYLE === "frontline" && tile.isEmpty == false && !(tile.tileType instanceof WaterTile)){
        //console.log(tile);
        if (tile.tileType.inCombat){
            ctx.fillStyle ="#FF00AC";
        }else{
            ctx.fillStyle = tile.tileType.terrain.color;
        }
        
    }else if(MAP_DISPLAY_STYLE === "troop" && tile.isEmpty == false && !(tile.tileType instanceof WaterTile)){
        
        if (tilePop.troop.troopCount > 1){
            ctx.fillStyle = tile.tileType.population.colony.color;
        }else{
            ctx.fillStyle = "#ACACAC";
        }

        // }else if(tile.tileType.ship.population.troop.troopCount > 1){
        //     ctx.fillStyle =tile.tileType.ship.population.colony.color;
        // }

    }
    else{
        ctx.fillStyle = tile.tileType.terrain.color;
    }
   
    ctx.fillRect(tile.getDrawX(), tile.getDrawY(), tile.getDrawSize() , tile.getDrawSize() );
    tile.toDraw = false;
}

function toHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}

/**
 * 
 * HTML
 * 
 */

function addDisplayMapButton(){
    let btn = document.getElementById("display_map_btn");
         

    btn.onclick = function () {
        STEPS = 0;
        SIZE = parseInt(document.getElementById("size_input").value);

        BOARD_WIDTH = c.width;
        BOARD_HEIGHT = c.height;
        // create a raw board to act as the image
        if(UPDATE_RAW_BOARD){
            RAW_BOARD = createRawBoard(); 
            UPDATE_RAW_BOARD = false;
        }


        //console.log(RAW_BOARD);

        //GAME_BOARD = convertCanvasTo2dArray(SIZE);
        GAME_BOARD = createGameBoardWithProperSizeFromRaw(SIZE);

        //reset overlay colonies 
        document.getElementById("overlay_buttons").innerHTML = "";


        //log(GAME_BOARD)

        ctx.clearRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT)
        drawAllTiles();

        //shuffleGameBoard();
        SHUFFLED_GAME_BOARD = shuffleGameBoard();

        // console.log(SHUFFLED_GAME_BOARD);
        // console.log(GAME_BOARD)

        //console.log(STEPS)
    }
}

function addChangeMapModeButton(){
    let btn = document.getElementById("change_map_mode_btn");
    btn.innerHTML = "Mode: Political"
    

    btn.onclick = function () {
        switch(MAP_DISPLAY_STYLE){
            case "political":
                btn.innerHTML = "Mode: Geo" ;
                MAP_DISPLAY_STYLE = "geo"
                break;
            case "geo":
                btn.innerHTML = "Mode: Population" ;
                MAP_DISPLAY_STYLE = "pop"
                break;
            case "pop":
                btn.innerHTML = "Mode: Political" ;
                MAP_DISPLAY_STYLE = "political"
                break;
        }
        
        drawAllTiles();
    }
}

function addPrintGameBoard(){
    let btn = document.getElementById("print_game_board");
    btn.style.display="none";

    btn.onclick = function () {
        console.log(GAME_BOARD);
        
    }
}

function addPauseButton(){
    let btn = document.getElementById("play_pause_btn");


    
    btn.onclick = function () {
        
        if (RUN_GAME){
            RUN_GAME = false;
            btn.innerHTML = "Play";
            btn.style.backgroundColor = "#6E9E5F";
        }else{
            RUN_GAME = true;
            btn.innerHTML = "Stop";
            btn.style.backgroundColor = "#F53B38";
        }
      
    };
}

function addNumberOfColniesButton(){
    let btn = document.getElementById("create_random_colonies");
    
    btn.onclick = function () {
        document.getElementById("overlay_buttons").innerHTML = "";

        //TODO set COLONY_ARRAY = [] ??? check if colonies remain in there
        removeOldStatDisplays();
        createRandomColoniesMain();
        createNewStatDisplays();


    }
}

function addMapModeButtons(){
    // political map mode button
    var btn = document.getElementById("display_political_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "political"
        drawAllTiles();

    }

    // geo map mode button
    btn = document.getElementById("display_geo_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "geo"
        drawAllTiles();

    }

    // pop map mode button
    btn = document.getElementById("display_pop_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "pop"
        drawAllTiles();
    }


    // Attack map mode button
    btn = document.getElementById("display_attack_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "attack"
        drawAllTiles();
    }

    // Defense map mode button
    btn = document.getElementById("display_defense_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "defense"
        drawAllTiles();
    }

    // Troop map mode button
    btn = document.getElementById("display_troop_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "troop"
        drawAllTiles();
    }
    
    
    // Troop map mode button
    btn = document.getElementById("display_frontline_map_btn");
    btn.onclick = function () {
        MAP_DISPLAY_STYLE = "frontline"
        drawAllTiles();
    }

}

function addEditTerrainButtons(){
    var btn = document.getElementById("main_terrain_edit_btn");
    hideAllEditTerrainButtons();

    btn.onclick = function () {
        if (SHOW_EDIT_TERRAIN_BUTTONS){
            btn.innerHTML = "Save Terrain";
            btn.style.backgroundColor = "#72DF9390";
            showAllEditTerrainButtons();
        }else{
            btn.innerHTML = "Edit Terrain";
            btn.style.backgroundColor = "#72DFDB90";
            hideAllEditTerrainButtons();
            
        }

    }


}

function addEditIndividualTerrainButtons(){

    // edit mountain button
    var btn = document.getElementById("mountains_terrain_edit_btn");
    btn.onclick = function () {
        SELECTOR.selectorType = "mountain";
    }

    // edit plain button
    var btn = document.getElementById("plains_terrain_edit_btn");
    btn.onclick = function () {
        SELECTOR.selectorType = "plain"

    }

    // edit river button
    var btn = document.getElementById("rivers_terrain_edit_btn");
    btn.onclick = function () {
        SELECTOR.selectorType = "river"

    }

    // edit forest button
    var btn = document.getElementById("forests_terrain_edit_btn");
    btn.onclick = function () {
        SELECTOR.selectorType = "forest"

    }
    // edit forest button
    var btn = document.getElementById("oceans_terrain_edit_btn");
    btn.onclick = function () {
        SELECTOR.selectorType = "ocean"

    }
}

function showAllEditTerrainButtons(){
    var div = document.getElementsByClassName("hidden_terrain_buttons");
    for (var i=0;i<div.length;i+=1){
        div[i].style.display = 'block';
    }
    SHOW_EDIT_TERRAIN_BUTTONS = false;


}

function hideAllEditTerrainButtons(){

    var div = document.getElementsByClassName("hidden_terrain_buttons");
    for (var i=0;i<div.length;i+=1){
        div[i].style.display = 'none';
    }

    SHOW_EDIT_TERRAIN_BUTTONS = true;


}

function addSpeedSlider(){

    const slider = document.getElementById("speed_slider");
    slider.oninput = function() {
        clearInterval(MAIN_INTERVAL)
        UPDATE_TIME = 255 - slider.value; // full -> every 5 mil-seconds
        //console.log(UPDATE_TIME)
        MAIN_INTERVAL = setInterval(function() {update()}, UPDATE_TIME);
      }
}

function addEditBrushSlider(){
    const slider = document.getElementById("brush_size_slider");

    slider.oninput = function() {
        EDIT_BRUSH_SIZE =parseInt(slider.value)
        //console.log(EDIT_BRUSH_SIZE);
    }
}

function addSelectButton(){
    let btn = document.getElementById("select_tile_btn");
    //btn.style.display = "none";

    btn.onclick = function () {
        SELECTOR.selectorType = "select"   
    }
}

function addSaveMapButton(){
    let btn = document.getElementById("save_map_btn");
    //btn.style.display = "none";

    btn.onclick = function () {
        const stringify = JSON.stringify(GAME_BOARD);

        downloadEntireMapWithJson(stringify);
    }
}

function addPlaceAndDrawCustomColonyButton(){
    const btnPlace = document.getElementById("custom_colony_place_colony_btn");
    btnPlace.onclick = function () {
        SELECTOR.selectorType = "place_colony"
        //console.log(SELECTOR.selectorType);
    }

    const btnDraw = document.getElementById("custom_colony_draw_colony_btn");
    btnDraw.onclick = function () {
        const overlay = document.getElementById("select_colony_overlay");

        overlay.style.display = "block";
        overlay.onclick = function () {
            overlay.style.display = "none";
        }
        SELECTOR.showSelectColonyOverlay = true;
        

       // console.log(SELECTOR.selectorType);
    }
}

function addViewUpcomingUpdates(){

    let btn = document.getElementById("view_upcoming_updates");

    btn.onclick = function () {
        const overlay = document.getElementById("upcoming_updates_overlay");

        overlay.style.display = "block";
        overlay.onclick = function () {
            overlay.style.display = "none";
        }
        SELECTOR.showSelectColonyOverlay = true;    }

}


/**
 * 
 * ==== Board Setup ====
 * 
 */

 function createGameBoardWithProperSizeFromRaw(size=SIZE){
    var tempRow = [];
    var tempTile;
    var board = [];


    if (size == 1){
        board = RAW_BOARD
        return board;
    }

    for (let row = 0; row < BOARD_HEIGHT; row+=size){
        tempRow = []
        for(let col = 0; col < BOARD_WIDTH; col+=size){
            tempTile = new Tile(col/size, row/size, size)

            // merges group of tiles into 1 tile returns true if plain tile type
            if (returnMergedTile(col, row, col + size, row + size)){
                //plain tile
                tempTile.tileType = new LandTile(PLAIN_TILE);
                tempTile.tileType.population = new Population(0, null);

                //tempTile.tileType.population.pop = Math.random() * maxStartingPop;
            }else{
                //tempTile.tileType = WATER_TILE;
                tempTile.tileType = new WaterTile(WATER_TILE);

            }
            tempRow.push(tempTile);
            STEPS++;
 
        }
        board.push(tempRow);   

    }
    return board;
}

function returnMergedTile(x,y,x2,y2){
    var plainCount = 0;
    var waterCount = 0;


    for(let row = y; row <y2; row++){
        for(let col=x; col<x2; col++){
            if (row < BOARD_HEIGHT && col < BOARD_WIDTH){
                //console.log("RC", row + ", " + col);
                //console.log("BHW" , BOARD_HEIGHT, BOARD_WIDTH + "YX" , row, col)
                //console.log(RAW_BOARD[row][col]);
                if(RAW_BOARD[row][col].tileType.terrain.name === "water"){
                    waterCount++;
                }else{
                    plainCount++;
                }
                STEPS++; 
            }

        }
    }
    // console.log("YX", y + ", " + x+ "| Y2X2", y2 + ", " + x2);
    // console.log(plainCount>=waterCount);

    return (plainCount>=waterCount);

}

function findMaxPopFromColonies(){
    //todo find the largest population from all colonies for map mode

    var maxPrevMaxPop = COLONY_ARRAY[0].prevMaxPop;

    for(let i=1; i< COLONY_ARRAY.length; i++){
        if (COLONY_ARRAY[i].prevMaxPop > maxPrevMaxPop){
            maxPrevMaxPop = COLONY_ARRAY[i].prevMaxPop;
        }

    }
    return maxPrevMaxPop;
}


function findMaxDefenseFromColonies(){
    //todo find the largest population from all colonies for map mode

    var prevMaxDefense = COLONY_ARRAY[0].prevMaxDefense;

    for(let i=1; i< COLONY_ARRAY.length; i++){
        if (COLONY_ARRAY[i].prevMaxDefense > prevMaxDefense){
            prevMaxDefense = COLONY_ARRAY[i].prevMaxDefense;
        }

    }
    return prevMaxDefense;
}


function findMaxAttackFromColonies(){
    var prevMaxAttack = COLONY_ARRAY[0].prevMaxAttack;

    for(let i=1; i< COLONY_ARRAY.length; i++){
        if (COLONY_ARRAY[i].prevMaxAttack > prevMaxAttack){
            prevMaxAttack = COLONY_ARRAY[i].prevMaxAttack;
        }

    }
    return prevMaxAttack;
}

/**
 * 
 * ==== Game Setup ====
 * 
 */

function createRandomColoniesMain(){
    // reset colony array
    COLONY_ARRAY =[]
    // get number of colonies to create 
    COLONY_COUNT = document.getElementById("random_colonies_input").value;
    //console.log(COLONY_COUNT);
    if (COLONY_COUNT > 0){
        // create new colony objects and place and draw them
        createCustomColoniesByAmount(COLONY_COUNT)
    }

    //console.log(COLONY_ARRAY);
}

function createCustomColonyName(){
    const namePartsObj = new NameParts();

    //console.log(namePartsObj.nameParts);
    const stemParts = Math.random() *2 + 1

    var name = "";
    for (let i = 0; i < stemParts; i++){
        name += namePartsObj.nameParts[Math.floor(Math.random() * namePartsObj.nameParts.length)]
    }
    name += " " + namePartsObj.suffix[Math.floor(Math.random() * namePartsObj.suffix.length)]

    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
}

function createCustomColoniesByAmount(numColonies){
    
    var randomColor;
    var tempColony;
    
    for(let i=0; i<numColonies; i++){
        randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
        
        //tempColony = createNewColonyWithStats("Colony"+i, randomColor, BASE_ATTACK, BASE_DEFENSE, BASE_RECRUIT_PERC, BASE_POP_GROWTH, BASE_EXPAND_RATE);
        tempColony = createNewColonyWithStats(createCustomColonyName(), randomColor, BASE_ATTACK, BASE_DEFENSE, BASE_RECRUIT_PERC, BASE_POP_GROWTH, BASE_EXPAND_RATE,BASE_MIL_STRENGTH);


        // add colony to array
        COLONY_ARRAY.push(tempColony);

        //TODO Optomize placing new colonies
        //place colonies on map

        const boardWidth = GAME_BOARD[0].length;
        const boardHeigth = GAME_BOARD.length

        var newX = Math.floor(Math.random() * boardWidth);
        var newY = Math.floor(Math.random() * boardHeigth);
        //console.log(newX, newY,"BWH", BOARD_WIDTH,BOARD_HEIGHT)
        //console.log(GAME_BOARD);

        while (GAME_BOARD[newY][newX].tileType.terrain.isMoveable == false){
            var newX = Math.floor(Math.random() * boardWidth);
            var newY = Math.floor(Math.random() * boardHeigth);
        }


        // placing colony
        placeColonyOnBoard(newX, newY, tempColony);

        // add colony to selecting overlay
        tempColony.createNewOverlayButton()
        

        drawTile(GAME_BOARD[newY][newX]);
    }
}


function placeColonyOnBoard(x, y, colony){
    GAME_BOARD[y][x].tileType.population.setStatsForInitialPlacement(GAME_BOARD[y][x], colony, BASE_POP);
    //console.log("Placing Colony");
}
function placeCustomColonyOnBoard(tile, colony, pop){
    //console.log(pop);
    GAME_BOARD[tile.y][tile.x].tileType.population.setStatsForInitialPlacement(GAME_BOARD[tile.y][tile.x], colony, pop);
    //console.log("Placing Custom Colony");

}


function createNewColonyWithStats(teamId, color,attack, defense, recruitPerc, popGrowth, expandRate,milStrength){
    //TODO make a similar function that creates random stats for the colony (if user wants random stats)
    // creates new colony
    //console.log(SELECTOR);
    var newColony = new Colony(teamId, color, SELECTOR);
    
    newColony.setColonyStats(attack, defense, recruitPerc, popGrowth, expandRate, milStrength)

    return newColony;
}

function AttemptReproduce(tile){
    // get a random neighboring tile
    var newX = randomIntFromRange(-1, 1) + tile.x
    var newY = randomIntFromRange(-1, 1) + tile.y

    const boardWidth = GAME_BOARD[0].length;
    const boardHeight = GAME_BOARD.length;

    

    if (WRAP_BOARD_OPT){
        if (newX < 0){
            newX =  boardWidth-1;
        }
        if (newX >= boardWidth){
            newX =  0;
        }
        if (newY < 0){
            newY =  boardHeight-1;
        }
        if (newY >= boardHeight){
            newY =  0;
        }
    }else{
        if (!(newX >= 0 && newX < GAME_BOARD[0].length && newY >= 0 && newY < GAME_BOARD.length)){
            return;
        }
    }
        
        var newTile = GAME_BOARD[newY][newX];
        //console.log(newTile);
        //check if tile is a waterTile
        if (newTile.tileType.terrain.isMoveable){
            // check if new tile is empty
            if (newTile.isEmpty){
                //tile is empty and land, so expand!
                expandToEmptyTile(tile, newTile)
            }else{
                if (newTile.tileType.population.colony.teamId !== tile.tileType.population.colony.teamId){
                    // new tile is an enemy
                    newTile.tileType.inCombat = true;
                    tile.tileType.inCombat = true;
                   // attackNewTileMain(tile, newTile);
                }else{
                    // same team
                    if (newTile.pop < tile.pop && !newTile.checkIfAtPopCap()){
                        // sends pop to a lower populated tile
                        //tile.migrateSomePopToTile(newTile);
                    }
                }
            }
        }else{

            //TODO condition for land tile attacking a ship  land -- reprodues onto water with an enemy
            // land tile sends off a navy (if it can)
            // check if you can build and newTile is empty and if new ship can be made

            if (newTile.isEmpty && tile.tileType.population.colony.currentActiveShips < tile.tileType.population.colony.activeNavalCap){

                // water tile is empty || checks if tile has enough pop to send troops
                newTile.tileType.createNewShipWithLandTile(newTile, tile);

            }

        }


}

function siegeLandTileMain(tile, newTile){
    if(tile.tileType.siegeLandTileFromWater(tile, newTile) ){
        // ship won --> attacker takes over tile
        tile.tileType.takeOverLandTileAfterSiege(tile, newTile)
    }

}

function attackNewTileMain(attackingTile, defendingTile){
    var colonySurround = [];
    var enemySurround = [];
    // attack new tile
    //console.log("ATTACK MAIN");
    if (attackingTile.tileType.population.attackEnemyTile(attackingTile, defendingTile)){
        // Attacker won -> move to defender's tile
        defendingTile.tileType.checkIfInCombat(attackingTile, GAME_BOARD, colonySurround, enemySurround);
        // console.log(colonySurround);
        // console.log(enemySurround);

        if (colonySurround.length >0){
            //console.log("=====");
            const randIndx = Math.floor(Math.random()*colonySurround.length);
            //console.log(`Retreating ${defendingTile.tileType.population.troop.troopCount} to new Tile ${colonySurround[randIndx].tileType.population.troop.troopCount}`);
            colonySurround[randIndx].tileType.population.troop.troopCount += defendingTile.tileType.population.troop.troopCount
            //console.log(`After: ${colonySurround[randIndx].tileType.population.troop.troopCount}`);
        }
        defendingTile.tileType.population.tranferStatsFromAttackerTile(defendingTile, attackingTile.tileType.population);
        // if defender colony is dead
    }

}

function expandToEmptyTile(oldTile, newTile){
    //console.log(newTile.y,newTile.x)
    newTile.tileType.population.setTransferStatsFromOldTileToEmptyTile(newTile, oldTile);
}

function createNewStatDisplays(){

    // loops through each colony in array to add a <p> to store stats
    for(let i=0; i< COLONY_ARRAY.length; i++){
        COLONY_ARRAY[i].createNewStatDisplay();
    }
}

function removeOldStatDisplays(){
    // removes all elements/tags stored in the div "stat_holder"
    const statNode = document.getElementById("stat_holder");
    while (statNode.lastElementChild) {
        statNode.removeChild(statNode.lastElementChild);
    }
}

function randomIntFromRange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function drawAllTiles(){
    for (let row = 0; row < GAME_BOARD.length; row+=1){
        for(let col = 0; col<GAME_BOARD[0].length ; col+=1){
            //console.log(GAME_BOARD[row][col].constructor.name);

            drawTile(GAME_BOARD[row][col]);
        }
    }
}

function moveShip(waterTile){
    // pick a random new tile
    var newX = randomIntFromRange(-1, 1)
    var newY = randomIntFromRange(-1, 1)


    //TODO implement navy Figure out issue
    if (waterTile.x + newX >= 0 && waterTile.x + newX < GAME_BOARD[0].length && waterTile.y + newY >= 0 && waterTile.y + newY < GAME_BOARD.length){

        const newTile = GAME_BOARD[waterTile.y + newY][waterTile.x +newX];
        // console.log("NewTile: ",waterTile.y + newY, waterTile.x + newX);
        // console.log("NewTile: ", newTile)

        //check if tile is empty
        if (newTile.isEmpty){
            // if newTile is water
            if (newTile.tileType.terrain.name === "water"){
                waterTile.tileType.moveShipToEmptyWaterTile(waterTile, newTile);
                //waterTile.moveShipToEmptyWaterTile(tile, newTile);
            }else if (newTile.tileType.terrain.isMoveable){
                // newTile is land
                // settle on new tile
                //newTile.setTransferStatsFromOldWaterToEmptyLand(waterTile);
                waterTile.tileType.moveShipToEmptyLandAndSettle(waterTile, newTile);
            }
        }else{
            // is not empty

            if (newTile.tileType.terrain.name === "water"){
                if (newTile.tileType.ship.population.colony.teamId === waterTile.tileType.ship.population.colony.teamId){
                    // same team
                    
                    // either ignore, or give pop (counter,, after 5 turns,, idk)
                }else{

                    // Naval Battle
                    waterTile.tileType.attackEnemyNavalShip(waterTile, newTile);

                }
            }else{
                //console.log("Pop: ", waterTile.tileType.ship.population.pop);
                // enemy land tile
                if (waterTile.tileType.ship.population.colony.teamId !== newTile.tileType.population.colony.teamId){
                    // TODO not occupied and Land is enemy
                    siegeLandTileMain(waterTile, newTile);

                }else{
                    //console.log(waterTile);
                    // friendly land tile --> transfers troops to land tile and removes ship
                    waterTile.tileType.landOnFriendlyTileFromWater(waterTile, newTile);
                }
            }

        }


    } 
    }  
    
function tileInCombatMain(tile, tilePop){
    //console.log("===========");

    var enemySurround = []
    var colonySurround = [];
    //selectedPop.combatTroopRequestsMain(selectedTile,GAME_BOARD);
    //check if still in combat
    tile.tileType.inCombat= tile.tileType.checkIfInCombat(tile, GAME_BOARD,colonySurround, enemySurround);

    
    if (tile.tileType.inCombat){
        //console.log("In Combat");

        //atttempt to attack random enemy tile (nearby)
        const randIndex = Math.floor(Math.random()*enemySurround.length);
        // console.log(enemySurround);
        // console.log(randIndex);
        // console.log(enemySurround[randIndex]);
        const defendingTile = enemySurround[randIndex] 
        if (defendingTile.isNew == false){
            attackNewTileMain(tile, defendingTile)
        }
    }

    tilePop.reinforceTroops(tilePop);
    if (MAP_DISPLAY_STYLE == "frontline"){
        //TODO change to own map display mode
        tile.toDraw = true;
    }
}

function tileNotInCombatButHasTroopsMain(tile, tilePop){
    var enemySurround = []
    var colonySurround = [];
    //TODO fix there errors
    if(tile.tileType.checkIfInCombat(tile, GAME_BOARD, enemySurround, colonySurround)){
        tile.tileType.inCombat = true;
    }else{
        if (colonySurround.length >0){
            colonySurround[Math.floor(Math.random()*colonySurround.length)] = tilePop.troop.troopCount;
        }else{
            // no neighnbohrs to send troops to
            //TODO move troops back to colony and set thsi to nothing
            tilePop.colony.reserveTroops += tilePop.troop.troopCount;
            tilePop.troop.troopCount = 0;
        }
    }
}

function checkIfTileAlive(tile){
    if (tile.tileType instanceof WaterTile && tile.isEmpty == false){
        if (tile.tileType.ship.population.colony.isDead){
            tile.tileType.emptyTileDecreaseActiveShips(tile);
        }
    }
}

/**
 * main loop that gets every tiles turn
 */
 function loopTileTurns(){
    //TODO perhaps create an away with no water tiles and only moveable tiles // or have ships in water
    ctx.beginPath();

    var selectedTile;
    var selectedPop;

    const rows = GAME_BOARD.length;
    const cols = GAME_BOARD[0].length;

    

    // iterates through all tiles
    // for (let row = 0; row < GAME_BOARD.length; row+=1){
    //     for(let col = 0; col<GAME_BOARD[0].length; col+=1){

    var row = 0;
    var col = 0;

    //console.log(rows-1, cols-1);
    while (row < rows) {
        while (col < cols) {
            //selectedTile = GAME_BOARD[row][col];
            //console.log(selectedTile);
            //console.log("Tile: ",row, col)
            selectedTile = SHUFFLED_GAME_BOARD[row][col];
            selectedPop = selectedTile.tileType.population;
            
            checkIfTileAlive(selectedTile);

            if (selectedTile.isNew == false){
                      
                // checks if tile is not empty
                if (selectedTile.isEmpty == false){
                        /// is not water:
                    if (selectedTile.tileType.terrain.name !== "water"){
                        ///Land Tile
                        if (selectedPop.colony.isDead){
                            selectedPop.emptyTile(selectedTile);
                        }

                        selectedTile.tileTurnDuties(GAME_BOARD);

                        if (selectedTile.tileType.inCombat){
                           tileInCombatMain(selectedTile,selectedPop);
                        }else if (selectedPop.troop.troopCount > 0){
                            //not in combat but has troops
                            tileNotInCombatButHasTroopsMain(selectedTile, selectedPop);
                        }

                        if (selectedPop.attemptToExpand()){
                            AttemptReproduce(selectedTile);
                        }
                        selectedPop.attemptMutateCulture(); //TODO update
                        selectedPop.checkIfStatsAreNewColonyMax(selectedTile);
                        selectedPop.updateColonyDisplayStats(selectedTile);

                    }else{
                        /// is non-empty water:
                        //check if colony is dead
                        if (selectedTile.tileType.ship.population.colony.isDead){

                            selectedTile.tileType.emptyTileDecreaseActiveShips(selectedTile);
                        }else{
                            moveShip(selectedTile);
                        }
                        
                    }
                }

                    // && selectedTile.isEmpty == false
                if ((selectedTile.toDraw || MAP_DISPLAY_STYLE === "pop" && selectedTile.isEmpty == false)){
                    drawTile(selectedTile);
                    selectedTile.toDraw = false; //TODO NEW
                }
            }else{

                // if tile was new, now it is not
                selectedTile.isNew = false;
                if (selectedTile.toDraw){
                    drawTile(selectedTile);
                }
            }
            col++;
        }
        row++;
        col = 0;

    }
}


function drawAllTilesForSpecialMaps(){
    if (MAP_DISPLAY_STYLE == "troop"){
        for (let row = 0; row < GAME_BOARD.length; row+=1){
            for(let col = 0; col<GAME_BOARD[0].length ; col+=1){
                if ( GAME_BOARD[row][col].isOccupiedLand){
                    //if(GAME_BOARD[row][col].tileType.population.troop.troopCount > 0 || GAME_BOARD[row][col].tileType.inCombat)
                        drawTile(GAME_BOARD[row][col]);
                }
            }
        }
    }
}


function shuffleGameBoard(){
    let a = []
    for (let i = 0; i < GAME_BOARD.length; i++){
        a[i] = [...GAME_BOARD[i]];
    }

    var m = a.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      //  swap it with the current element.
      t = a[m];
      a[m] = a[i];
      a[i] = t;
    }

    for(let i=0; i<a.length; i++){
        if(Math.random()*2 < 1){
            a[i] = a[i].reverse();
        }
        //console.log(a[i]);

    }
   
  
    return a;
    }


function resetAllColoniesDisplayStats(){
    for(let i=0; i< COLONY_ARRAY.length; i++){
        COLONY_ARRAY[i].resetTotalDisplayStats();
    }
}

function displayAllColoniesStats(){
    for(let i=0; i< COLONY_ARRAY.length; i++){
        COLONY_ARRAY[i].displayStats();
        // set current stats to prev stats
        COLONY_ARRAY[i].setCurrentMaxToPrevMax();

    }
}

function checkForDeadColonies(){

    for(let i=0; i< COLONY_ARRAY.length; i++){
        const colony = COLONY_ARRAY[i];
       if(colony.totalTiles <=0 && colony.newTiles == 0){
            colony.isDead = true;
            //console.log(colony.currentActiveShips)
            COLONY_ARRAY.splice(i,1); 
            //console.log(i,"REMOVED");
            colony.display.remove();

       }
    }
}

function update(){
    if (RUN_GAME){
        var startTime = performance.now()
        resetAllColoniesDisplayStats();
        loopTileTurns();
        checkForDeadColonies();
        //TODO make an optionla button to display stats
        displayAllColoniesStats();
        var endTime = performance.now()
        const time = endTime - startTime
        // console.log(`update took ${(Math.round(time * 100) / 100).toFixed(2)} milliseconds | ~ ${Math.round(1000/((time)))} TPS`)
        drawAllTilesForSpecialMaps();

    }
}

/**
 * 
 * MAIN
 */
startGame();

//setInterval(function() {update()},UPDATE_TIME);
var MAIN_INTERVAL = setInterval(function() {update()}, UPDATE_TIME);


