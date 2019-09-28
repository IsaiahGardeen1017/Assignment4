"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4} from "./helperfunctions.js";

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
        let points: vec4[] = [];
        addGrassPoints(points);
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
        mv = mv.mult(rotateY(-ticks));

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 156);    // draw the truck
    }


}

function addGrassPoints(points) {
    let color:vec4 = new vec4(0, 1, 0, 1);
    let size:number = 1;
    points.push(new vec4(size, 0, size, 1));//corner
    points.push(color);//color
    points.push(new vec4(size, 0, -size, 1));//corner
    points.push(color);//color
    points.push(new vec4(-size, 0, size, 1));//corner
    points.push(color);//color

    points.push(new vec4(-size, 0, size, 1));//corner
    points.push(color);//color
    points.push(new vec4(size, 0, -size, 1));//corner
    points.push(color);//color
    points.push(new vec4(-size, 0, -size, 1));//corner
    points.push(color);//color
}