"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4} from "./helperfunctions.js";
import {camera} from "./camera";

export class grassObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;

    cam:camera;

    numPoints:number;

    bufferId:WebGLBuffer;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram, cam:camera){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();
        this.cam = cam;

        //Set Geometry
        this.bindToBuffer();
        let points: vec4[] = addGrassPoints();
        this.numPoints = points.length;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
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


    draw(){
        this.bindToBuffer();
        let mv:mat4 = this.cam.look();
        let lightPosition:mat4 = mv;

        //Translations
        //mv = mv.mult(rotateY(45));
        mv = mv.mult(translate(0, -1, 0));
        this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "light_position"), (lightPosition.mult(new vec4(0, 10, 0, 1))).flatten());

        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vAmbientColor"), [0.0, 0.5, 0.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vDiffuseColor"), [0.0, 0.5, 0.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vSpecularColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib1f(this.gl.getAttribLocation(this.program, "vSpecularExponent"), 100.0);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);
    }
}

function addGrassPoints():vec4[] {
    let diameter:number = 100;
    let grassPoints:vec4[] = [];
    for(let i = -diameter; i <= diameter - 1; i++){
        for(let n = -diameter; n <= diameter - 1; n++){
            addSquare(grassPoints, i,n);
        }
    }
    return grassPoints;
}

function addSquare(points:vec4[], x:number, z:number){
    let max:number = 0.55;
    let min:number = 0.5;
    let color:vec4 = new vec4((1 - (Math.random() * (max - min) + min)), (1 - (Math.random() * (max - min) + min)), (1 - (Math.random() * (max - min) + min)), 1);

    /*
    let color:vec4 = new vec4(.1, 1, .1, 1);
    if((x+z) % 2 == 0){
        color = new vec4(0, .9, 0, 1);
    }
    */
    points.push(new vec4(0 + x,0,1 + z,1));
    points.push(color);
    points.push(new vec4(1 + x,0,1 + z,1));
    points.push(color);
    points.push(new vec4(1 + x,0,0 + z,1));
    points.push(color);

    color = new vec4((1 - (Math.random() * (max - min) + min)), (1 - (Math.random() * (max - min) + min)), (1 - (Math.random() * (max - min) + min)), 1);

    points.push(new vec4(0 + x,0,0 + z,1));
    points.push(color);
    points.push(new vec4(0 + x,0,1 + z,1));
    points.push(color);
    points.push(new vec4(1 + x,0,0 + z,1));
    points.push(color);

}