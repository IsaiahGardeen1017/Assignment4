"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4, scalem, rotateZ, rotateX, toradians} from "./helperfunctions.js";
import {getPlyPoints} from "./PlyReader.js";


export class headObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;
    bufferId:WebGLBuffer;

    numPoints:number;

    yRotOffset:number = 0;
    headMaxRotation = 15;
    headRotationSpeed = 1;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();


        //Set Geometry
        this.bindToBuffer();
        let points:vec4[];
        points = generateHeadPoints();
        this.numPoints = points.length;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
    }

    turnHeadRight(){
        this.yRotOffset -= this.headRotationSpeed;
    }

    turnHeadLeft(){
        this.yRotOffset += this.headRotationSpeed;
    }

    bindToBuffer(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.bufferId);
        this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 32, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

        this.vColor = this.gl.getAttribLocation(this.program, "vNormal");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.vColor);
    }


    draw(mv:mat4){
        this.bindToBuffer();


        //Translations
        mv = mv.mult(translate(-0.1,0,0));
        mv = mv.mult(scalem(.01, .01, .01));
        mv = mv.mult(rotateY(this.yRotOffset + 180));
        mv = mv.mult(rotateX(-90));


        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vAmbientColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vDiffuseColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vSpecularColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib1f(this.gl.getAttribLocation(this.program, "vSpecularExponent"), 50.0);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);
    }


}

function generateHeadPoints():vec4[]{
    return getPlyPoints("HEAD.txt");
}
