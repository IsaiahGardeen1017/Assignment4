"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4, scalem, rotateZ, rotateX, toradians} from "./helperfunctions.js";
import {getPlyPoints} from "./PlyReader.js";


export class wheelObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;
    bufferId:WebGLBuffer;
    numPoints:number;
    zRotOffset:number = 0;
    frontWheel:boolean;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram, frontWheel:boolean){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();

        this.frontWheel = frontWheel;

        //Set Geometry
        this.bindToBuffer();
        let points:vec4[];
        points = generateWheelPoints();
        this.numPoints = points.length;
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

    spin(zrot:number){
        let rotSpeed:number = 90;
        this.zRotOffset += (zrot * rotSpeed);
    }

    draw(direction:number, steeringWheel:number, mv:mat4){
        this.bindToBuffer();
        let maxTurnAngle:number = 15; //Determines how far the wheels turn (arbitrary)
        //Translations
        let scaler:number = .01;
        mv = mv.mult(scalem(scaler, scaler, scaler));
        if(this.frontWheel){
            mv = mv.mult(rotateY(steeringWheel * maxTurnAngle));
        }
        mv = mv.mult(rotateZ(direction * this.zRotOffset));
        mv = mv.mult(rotateX(90));



        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);    // draw the truck
    }


}

function generateWheelPoints():vec4[]{
    return getPlyPoints("REARWHEEL.txt");
}

