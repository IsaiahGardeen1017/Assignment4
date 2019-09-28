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

let ticks:number;

let truck:truckObject;
let grass:grassObject;




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

    ticks = 0;
    window.setInterval(update, 16); //60 fps
}

function update(){
    ticks++;

    document.getElementById("output").innerHTML = "" + truck.sliderValue;
    requestAnimationFrame(renderFrame);
}

function keydownEvent(key:string){
    switch(key) {
        case"w":
            truck.tXpos -= 0.1;
            break;
        case"s":
            truck.tXpos += 0.1;
            break;
        case"q":
            truck.tYpos -= 0.1;
            break;
        case"a":
            truck.tYpos += 0.1;
            break;
        case"r":
            truck.sliderValue -= 0.01;
            break;
        case"f":
            truck.sliderValue += 0.01;
            break;
        case"z":
            truck.tYrot -= 1;
            break;
        case"c":
            truck.tYrot += 1;
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