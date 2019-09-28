"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4, scalem, rotateZ, toradians} from "./helperfunctions.js";
import {geometryGenerator} from "./geometryGenerator.js";


export class wheelObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;


    bufferId:WebGLBuffer;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();

        //Set Geometry
        this.bindToBuffer();
        let points:vec4[];
        points = addWheelPoints();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
    }


    bindToBuffer(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 32, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

        this.vColor = this.gl.getAttribLocation(this.program, "vColor");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.vColor);
    }


    draw(ticks:number, mv:mat4){
        this.bindToBuffer();

        //Translations
        mv = mv.mult(scalem(.1, .1, .1));
        mv = mv.mult(rotateZ(ticks * 10));

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 156);    // draw the truck
    }


}

function addWheelPoints():vec4[]{
    let gg:geometryGenerator = new geometryGenerator();



    //Rubber
    let rubberThickness:number = 0.4;
    let rubberDiameter:number = 1;
    for(let i:number = 0; i <= 11; i++){
        gg.addVertex(i, rubberDiameter * Math.cos(toradians(i*30)), rubberDiameter * Math.sin(toradians(i * 30)), rubberThickness);
    }
    for(let i:number = 0; i <= 11; i++){
        gg.addVertex(i + 12, rubberDiameter * Math.cos(toradians(i*30)), rubberDiameter * Math.sin(toradians(i * 30)), -rubberThickness);
    }
    gg.addVertex(24, 0,0,rubberThickness);
    gg.addVertex(25, 0,0,-rubberThickness);

    let rubberColor:vec4 = new vec4(0.1,0.1,0.1,1);
    for(let i:number = 0; i <= 11; i++){
        gg.addTriangle(24, (i+1)%12, i, rubberColor);
        gg.addTriangle(25, ((i+1)%12) + 12, i + 12, rubberColor);
    }

    for(let i:number = 0; i <= 11; i++) {
        gg.addTriangle((i+1)%12, ((i+1)%12) + 12, i, rubberColor);
        gg.addTriangle(i, ((i+1)%12) + 12, i+12, rubberColor);
    }

    /*
    //Rim
    let rimThickness:number = 0.42;
    let rimDiameter:number = 0.66;
    for(let i:number = 0; i <= 11; i++){
        gg.addVertex(i, rimDiameter * Math.cos(toradians(i*30)), rimDiameter * Math.sin(toradians(i * 30)), rimThickness);
    }
    for(let i:number = 0; i <= 11; i++){
        gg.addVertex(i + 12, rimDiameter * Math.cos(toradians(i*30)), rimDiameter * Math.sin(toradians(i * 30)), -rimThickness);
    }
    gg.addVertex(24, 0,0,rimThickness);
    gg.addVertex(25, 0,0,-rimThickness);

    let rimColor:vec4 = new vec4(0.1,0.1,0.1,1);
    let blackColor:vec4 = new vec4(0,0,0,1);
    for(let i:number = 0; i <= 11; i++){
        gg.addTriangle(24, (i+1)%12, i, rimColor);
        gg.addTriangle(25, ((i+1)%12) + 12, i + 12, rimColor);
    }

    for(let i:number = 0; i <= 11; i++) {
        gg.addTriangle((i+1)%12, ((i+1)%12) + 12, i, rimColor);
        gg.addTriangle(i, ((i+1)%12) + 12, i+12, rimColor);
    }
    */



    return gg.getTrianglePoints();

}

