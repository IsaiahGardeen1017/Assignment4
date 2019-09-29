 //These are some functions, lmao
 "use strict";


import {truckObject} from "./truckObject.js";
import {grassObject} from "./grassObject.js";
import {vec4, mat4, initShaders, perspective, lookAt, flatten, translate, rotateY, rotateX, rotateZ, rotate} from './helperfunctions.js';

let gl:WebGLRenderingContext;
let canvas:HTMLCanvasElement;
let program:WebGLProgram;
let umv:WebGLUniformLocation;
let uproj:WebGLUniformLocation;

//increases every fram
let ticks:number;

let truck:truckObject;
let grass:grassObject;


//if the key is down
let wDown:boolean = false;
let sDown:boolean = false;
let aDown:boolean = false;
let dDown:boolean = false;
let spaceDown:boolean = false;

 window.onload = function init(){
    canvas = document.getElementById("gl-canvas") as HTMLCanvasElement;
    gl = canvas.getContext('webgl2') as WebGLRenderingContext;
    if(!gl){
        alert("Web GL is not available")
    }

    //Shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader")
    gl.useProgram(program);

    umv = gl.getUniformLocation(program, "model_view");
    uproj = gl.getUniformLocation(program, "projection");

    gl.viewport(0,0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);


    truck = new truckObject(gl, program);
    grass = new grassObject(gl, program);



    window.addEventListener("keydown", function(event){
        keydownEvent(event.key);
    });
     window.addEventListener("keyup", function(event){
         keyupEvent(event.key);
     });
    ticks = 0;
    window.setInterval(update, 16); //60 fps
}

function update(){
    ticks++;



    //Key input handling
    if(wDown){
        truck.gasPedal += truck.gasPedalSpeed * 2;
    }
    if(sDown){
        truck.brakePedal += truck.brakePedalSpeed * 2;
    }



    if(aDown){
        truck.steeringWheel += truck.steeringWheelSpeed * 2;
    }
    if(dDown){
        truck.steeringWheel -= truck.steeringWheelSpeed * 2;
    }

        let r:number = Math.floor(255 * truck.brakePedal);
        let g:number = Math.floor(255 * truck.gasPedal);
        document.getElementById("revs").style.fill = 'rgb(' + r + "," + g + ",0)";

    truck.tick();

    if(ticks % 8 == 0){
    document.getElementById("output").innerHTML = "" + truck.realVelocity.mag() + "  ||  " + truck.realVelocity;
    }
    requestAnimationFrame(renderFrame);
}

function keydownEvent(key:string){
    switch(key) {
        case"w":
            wDown = true;
            break;
        case"s":
            sDown = true;
            break;
        case" ":
            spaceDown = true;
            break;
        case"a":
            aDown = true;
            break;
        case"d":
            dDown = true;
            break;
        case"r":
            truck.dir = new vec4(truck.dir[0] * -1, 0,0,0);
    }
}

 function keyupEvent(key:string){
     switch(key) {
         case"w":
             wDown = false;
             break;
         case"s":
             sDown = false;
             break;
         case" ":
             spaceDown = false;
             break;
         case"a":
             aDown = false;
             break;
         case"d":
             dDown = false;
             break;
     }
 }



function renderFrame(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    let p:mat4 = perspective(45.0, canvas.clientWidth / canvas.clientHeight, 1.0, 100.0);
    gl.uniformMatrix4fv(uproj, false, p.flatten());

    truck.draw(ticks);
    grass.draw(ticks);

 }