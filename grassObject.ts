"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4} from "./helperfunctions.js";
import {geometryGenerator} from "./geometryGenerator.js";

export class grassObject{
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
        let points: vec4[] = addGrassPoints();
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


    draw(ticks:number){
        this.bindToBuffer();
        let mv:mat4 = lookAt(new vec4(0, 1, 5, 1), new vec4(0,0,0,1), new vec4(0,1,0,0));

        //Translations
        mv = mv.mult(rotateY(45));
        mv = mv.mult(translate(0, 0, 0));

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 10000);    // draw the truck
    }


}

function addGrassPoints():vec4[] {
    let color1:vec4 = new vec4(.1, 1, .1, 1);
    //let color1:vec4 = new vec4(0, .9, 0, 1);
    let color2:vec4 = new vec4(0, .9, 0, 1);
    let size:number = 100; //Must be odd, most definitely because of off by one error somewhere but it works so i'm not going to change it, maybe i do need a loop invarient
    let halfSize :number = Math.floor(size/2);

    let gg1:geometryGenerator = new geometryGenerator();
    for(let i:number = 0; i < size; i++){
        gg1.addVertex(i,  i - halfSize, 0, halfSize);
    }
    for(let i:number = 0; i < size; i++){
        gg1.addVertex(i + size, i - halfSize, 0, -halfSize);
    }

    for(let i:number = 0; i < size - 1; i++){
        let color:vec4 = color1;
        if(i%2 == 0){
            color = color2;
        }
        gg1.addTriangle(i, i+1, i+size, color);
        gg1.addTriangle(i+size, i+1, i+size+1, color);
    }

    return gg1.getTrianglePoints();
}