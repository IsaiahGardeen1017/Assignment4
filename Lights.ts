"use strict";

import {truckObject} from "./truckObject.js";
import {mat4, rotateX, rotateY, rotateZ, toradians, vec4} from "./helperfunctions.js";

export function sendLightArrays(truck:truckObject, gl:WebGLRenderingContext, program:WebGLProgram, look:mat4, frame:number){

    let lightColors:number[] = [];
    let lightPositions:number[] = [];
    let lightDirections:number[] = [];
    let lightAngles:number[] = [];


    //Overhead Light
    lightColors = lightColors.concat([1, 1, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(0, 10, 0, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(new vec4(0, -1, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(0)));


    //Headlight
    lightColors = lightColors.concat([1, 1, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot - 1)).mult(new vec4(1, 0, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(15)));

    //Headlight
    lightColors = lightColors.concat([1, 1, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot + 1)).mult(new vec4(1, 0, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(15)));

    //Red Siren
    lightColors = lightColors.concat([1, 1, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset + 0.5, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot + 1)).mult(new vec4(1, 0, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(15)));

    //Blue Siren
    lightColors = lightColors.concat([1, 1, 1, 1]);
    lightPositions = lightPositions.concat(look.mult(new vec4(truck.xoffset, truck.yoffset + 0.5, truck.zoffset, 1)).flatten());
    lightDirections = lightDirections.concat(look.mult(rotateY(truck.yrot + 1)).mult(new vec4(1, 0, 0, 0)).flatten());
    lightAngles.push(Math.cos(toradians(15)));

    gl.uniform4fv(gl.getUniformLocation(program, "light_color"), lightColors);//Light color
    gl.uniform4fv(gl.getUniformLocation(program, "ambient_light"), [.25, .25, .25, 1]);//intensity
    gl.uniform4fv(gl.getUniformLocation(program, "light_position"), lightPositions);
    gl.uniform4fv(gl.getUniformLocation(program, "light_direction"), lightDirections);
    gl.uniform1fv(gl.getUniformLocation(program, "angle"), lightAngles);
}