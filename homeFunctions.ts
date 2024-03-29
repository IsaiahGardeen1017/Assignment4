 //These are some functions, lmao
 "use strict";


import {truckObject} from "./truckObject.js";
import {grassObject} from "./grassObject.js";
import {
    vec4,
    mat4,
    initFileShaders,
    perspective,
    lookAt,
    flatten,
    translate,
    rotateY,
    rotateX,
    rotateZ,
    rotate,
    toradians
} from './helperfunctions.js';
import {camera} from "./camera.js";
import {sendLightArrays, toggleDayNight, toggleHeadlights, toggleSiren} from "./Lights.js";

let gl:WebGLRenderingContext;
let canvas:HTMLCanvasElement;
let program:WebGLProgram;
let uproj:WebGLUniformLocation;

//increases every frame
let frames:number;

let truck:truckObject;
let grass:grassObject;

let cam:camera;

let breakingPeriodStart:number  = -1;
let reverse:boolean = false;

//if the key is down
let increaseGasPedal:boolean = false;
let increaseBreak:boolean = false;
let turnWheelLeft:boolean = false;
let turnWheelRight:boolean = false;
let spaceDown:boolean = false;
let turnHeadLeftDown:boolean = false;
let turnHeadRightDown:boolean = false;

let positionValue:number = 0;//TODO DONT HAND IN THIS

 window.onload = function init(){
    canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
    gl = canvas.getContext('webgl2') as WebGLRenderingContext;
    if(!gl){
        alert("Web GL is not available")
    }

    //Shaders
    program = initFileShaders(gl, "./Shaders/vshader-phong.glsl", "./Shaders/fshader-phong.glsl")
    gl.useProgram(program);

    uproj = gl.getUniformLocation(program, "projection");

    gl.viewport(0,0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);

    //gl.cullFace(gl.BACK);
    //gl.enable(gl.CULL_FACE);

    cam = new camera();
    truck = new truckObject(gl, program, cam);
    grass = new grassObject(gl, program, cam);
    cam.truck = truck; //Not sure of a better way of doing this

    let btn = document.getElementById("toggleButton");
    btn.addEventListener('click', function (event){
        truck.funmode = !truck.funmode;
    });


    window.addEventListener("keydown", function(event){
        keydownEvent(event.key);
    });
     window.addEventListener("keyup", function(event){
         keyupEvent(event.key);
     });
    frames = 0;
    window.setInterval(update, 32);
}

function update(){
    frames++;

    if(!increaseBreak && !reverse || !increaseGasPedal && reverse){
        breakingPeriodStart = -1;
    }
    //I wrote this next bit in a chick fil a parking lot at midnight and somehow it works
    let breakDelay:number = 60;
    if(!reverse || !truck.funmode) {
        if(!truck.funmode) {
            reverse = true;
        }
        //Moving the pedals based on keys
        if (increaseGasPedal) {
            if(!truck.funmode){
                truck.brakePedal = 0;
            }
            truck.gasPedal += truck.gasPedalSpeed * 2;
            breakingPeriodStart = -1;
        }
        if (increaseBreak) {
            if(!truck.funmode){
                truck.gasPedal = 0;
            }
            if (breakingPeriodStart == -1 && truck.funmode) {
                breakingPeriodStart = frames;
            }else if(breakingPeriodStart + breakDelay == frames && truck.funmode){
                reverse = true;
                breakingPeriodStart = -1;
                truck.dir = new vec4(truck.dir[0] * -1, 0,0,0);
            }
            truck.brakePedal += truck.brakePedalSpeed * 2;
        }
    }else{//in reverse
        if (increaseBreak) {
            truck.gasPedal += truck.gasPedalSpeed * 2;
            breakingPeriodStart = -1;
        }
        if (increaseGasPedal) {
            if (breakingPeriodStart == -1 && truck.funmode) {
                breakingPeriodStart = frames;
            }else if(breakingPeriodStart + breakDelay == frames  && truck.funmode){
                reverse = false;
                breakingPeriodStart = -1;
                truck.dir = new vec4(truck.dir[0] * -1, 0,0,0);
            }
            truck.brakePedal += truck.brakePedalSpeed * 2;
        }
    }
    if(spaceDown){
        if(truck.funmode){
            truck.brakePedal += truck.brakePedalSpeed * 2;
        }else{
            truck.gasPedal = 0;
            truck.brakePedal = 0;
            truck.steeringWheel = 0;
            truck.velocity = new vec4(0,0,0,0);
        }
    }
    if(turnWheelLeft){
        truck.steeringWheel += truck.steeringWheelSpeed * 2;
    }
    if(turnWheelRight){
        truck.steeringWheel -= truck.steeringWheelSpeed * 2;
    }

        let r:number = Math.floor(255 * truck.brakePedal);
        let g:number = Math.floor(255 * truck.gasPedal);
        document.getElementById("revs").style.fill = 'rgb(' + r + "," + g + ",0)";
    truck.update();
    cam.update();
    if(truck.funmode) {
        document.getElementById("output").innerText = positionValue + " You are in fun physics mode! you can toggle to boring assignment mode.";
    }else{
        document.getElementById("output").innerText = positionValue + " You are in boring assignment mode, you can toggle to fun physics mode!";
    }

    if(turnHeadRightDown) {
        truck.head.turnHeadRight();
    }
    if(turnHeadLeftDown){
        truck.head.turnHeadLeft();
    }
    requestAnimationFrame(renderFrame);
}


function keydownEvent(key:string){
    switch(key) {
        case"ArrowUp":
            increaseGasPedal = true;
            break;
        case"ArrowDown":
            increaseBreak = true;
            break;
        case" ":
            spaceDown = true;
            break;
        case"ArrowLeft":
            turnWheelLeft = true;
            break;
        case"ArrowRight":
            turnWheelRight = true;
            break;
        case"z":
            turnHeadLeftDown = true;
            break;
        case"x":
            turnHeadRightDown = true;
            break;
        case"q":
            cam.zoomIn();
            break;
        case"w":
            cam.zoomOut();
            break;
        case"s":
            cam.dollyIn();
            break;
        case"a":
            cam.dollyOut();
            break;
        case"f":
            cam.toggleFreeCam();
            break;
        case"1":
            cam.toFreeCam();
            break;
        case"2":
            cam.toChaseCam();
            break;
        case"3":
            cam.toViewpointCam();
            break;
        case"o":
            positionValue++;
            break;
        case"l":
            positionValue--;
            break;
        case"0":
            toggleDayNight(gl);
            break;
        case"9":
            toggleHeadlights();
            break;
        case"8":
            toggleSiren();
            break;

    }
}

 function keyupEvent(key:string){
     switch(key) {
         case"ArrowUp":
             increaseGasPedal = false;
             break;
         case"ArrowDown":
             increaseBreak = false;
             break;
         case" ":
             spaceDown = false;
             break;
         case"ArrowLeft":
             turnWheelLeft = false;
             break;
         case"ArrowRight":
             turnWheelRight = false;
             break;
         case"z":
             turnHeadLeftDown = false;
             break;
         case"x":
             turnHeadRightDown = false;
             break;
     }
 }


function renderFrame(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    let p:mat4 = perspective(cam.fov, canvas.clientWidth / canvas.clientHeight, 0.01, 1000.0);

    sendLightArrays(truck, gl, program, cam.look(), frames);

    gl.uniformMatrix4fv(uproj, false, p.flatten());
    truck.draw(!(cam.camType === "viewpoint"), positionValue);
    grass.draw();

 }