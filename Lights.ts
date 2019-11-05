"use strict";

import {truckObject} from "./truckObject.js";
import {mat4, rotateX, rotateY, rotateZ, toradians, vec4} from "./helperfunctions.js";

let nightmode = false;
let headlights = false;
let siren = false;

export function toggleHeadlights(){
    headlights = !headlights;
}

export function toggleSiren(){
    siren = !siren;
}

export function toggleDayNight(gl:WebGLRenderingContext){
    if(nightmode){
        toDay(gl);
    }else{
        toNight(gl);
    }
}

function toNight(gl:WebGLRenderingContext){
    nightmode = true;
    gl.clearColor(0.1,0.1,0.1,1);
}

function toDay(gl:WebGLRenderingContext){
    nightmode = false;
    gl.clearColor(0, 1, 1, 1);
}


export function sendLightArrays(truck:truckObject, gl:WebGLRenderingContext, program:WebGLProgram, look:mat4, frame:number){

    let lightColors:number[] = [];
    let lightPositions:number[] = [];
    let lightDirections:number[] = [];
    let lightAngles:number[] = [];


    //Overhead Light
    if(nightmode) {
        lightColors = lightColors.concat([0.05, 0.05, 0.05, 1]);
    }else{
        lightColors = lightColors.concat([1, 1, 1, 1]);
    }
    lightPositions = lightPositions.concat(look.mult(new vec4(0, 10, 0, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(new vec4(0, -1, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(180)));


    //Headlight
    lightColors = lightColors.concat([1, 1, 0.75, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot - 2)).mult(new vec4(1, 0, 0, 0)).flatten());
    if(headlights) {
        lightAngles.push(Math.cos(toradians(15)));
    }else{
        lightAngles.push(Math.cos(toradians(0)));
    }

    //Headlight
    lightColors = lightColors.concat([1, 1, 0.75, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot + 2)).mult(new vec4(1, 0, 0, 0)).flatten());
    if(headlights) {
        lightAngles.push(Math.cos(toradians(15)));
    }else{
        lightAngles.push(Math.cos(toradians(0)));
    }

    //Red Siren
    lightColors = lightColors.concat([1, 0, 0, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset + 0.5, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY((5 * frame) + truck.yrot)).mult(new vec4(1, 0, 0, 0)).flatten());
    if(siren) {
        lightAngles.push(Math.cos(toradians(15)));
    }else{
        lightAngles.push(Math.cos(toradians(0)));
    }

    //Blue Siren
    lightColors = lightColors.concat([0, 0, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset + 0.5, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY((5 * frame) + truck.yrot)).mult(new vec4(-1, 0, 0, 0)).flatten());
    if(siren) {
        lightAngles.push(Math.cos(toradians(15)));
    }else{
        lightAngles.push(Math.cos(toradians(0)));
    }

    gl.uniform4fv(gl.getUniformLocation(program, "light_color"), lightColors);//Light color
    gl.uniform4fv(gl.getUniformLocation(program, "ambient_light"), [.25, .25, .25, 1]);//intensity
    gl.uniform4fv(gl.getUniformLocation(program, "light_position"), lightPositions);
    gl.uniform4fv(gl.getUniformLocation(program, "light_direction"), lightDirections);
    gl.uniform1fv(gl.getUniformLocation(program, "angle"), lightAngles);
}