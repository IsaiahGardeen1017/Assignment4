 //These are some functions, lmao
 "use strict";
let gl:WebGLRenderingContext;
let canvas:HTMLCanvasElement;
let program:WebGLProgram;
let bufferId:WebGLBuffer;
let umv:WebGLUniformLocation;
let uproj:WebGLUniformLocation;

let vPosition:GLint;
let vColor:GLint;

import{vec4, mat4, initShaders, perspective, lookAt} from './helperfunctions.js';

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

    window.addEventListener("keydown", function(event){
       keydownEvent(event.key);
    });

    makeGeometryAndBuffer();

    window.setInterval(update, 16); //60 fps
    requestAnimationFrame(render);
}

function update(){

}

function keydownEvent(key:string){
    switch(key) {
        case"r":
            alert("r");
            break;
    }
}

function  makeGeometryAndBuffer(){

}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let p:mat4 = perspective(45.0, canvas.clientWidth / canvas.clientHeight, 1, 100);
    gl.uniformMatrix4fv(uproj, false, p.flatten());



    let mv:mat4 = lookAt(new vec4(0,0,5,1), new vec4(0,0,0,1), new vec4(0,1,0,0));

    //Transformations translations and roations here



}