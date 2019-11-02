"use strict";

import {flatten, lookAt, mat4, rotateX, rotateY, scalem, translate, vec4} from "./helperfunctions.js";
import {camera} from "./camera";
import {getPlyPoints} from "./PlyReader.js";

export class grassObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;

    cam:camera;

    numTrackPoints:number;
    numGrassPoints:number;

    tarmacBufferId:WebGLBuffer;
    grassBufferId:WebGLBuffer;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram, cam:camera){
        this.gl = gl;
        this.program = program;
        this.tarmacBufferId = this.gl.createBuffer();
        this.grassBufferId = this.gl.createBuffer();
        this.cam = cam;

        //Set Geometry
        this.bindToTarmacBuffer();
        let points: vec4[] = addTarmacPoints();
        this.numTrackPoints = points.length;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);

        this.bindToGrassBuffer();
        points = addGrassPoints();
        this.numGrassPoints = points.length;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);

    }



    bindToTarmacBuffer(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tarmacBufferId);
        this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 32, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

        this.vColor = this.gl.getAttribLocation(this.program, "vNormal");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.vColor);
    }

    bindToGrassBuffer(){
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.grassBufferId);
        this.vPosition = this.gl.getAttribLocation(this.program, "vPosition");
        this.gl.vertexAttribPointer(this.vPosition, 4, this.gl.FLOAT, false, 32, 0);
        this.gl.enableVertexAttribArray(this.vPosition);

        this.vColor = this.gl.getAttribLocation(this.program, "vNormal");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.vColor);
    }


    draw(){
        this.bindToTarmacBuffer();
        let mv:mat4 = this.cam.look();
        //Translations

        let mvT = mv.mult(scalem(5,5 ,5));
        mvT = mvT.mult(rotateX(90));
        mvT = mvT.mult(translate(0, 0, 0.06));
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vAmbientColor"), [0.3, 0.3, 0.3, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vDiffuseColor"), [0.3, 0.3, 0.3, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vSpecularColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib1f(this.gl.getAttribLocation(this.program, "vSpecularExponent"), 1000.0);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mvT.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numTrackPoints);


        this.bindToGrassBuffer();
        //Translations
        mvT = mvT.mult(translate(0, 0, 0.21));
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vAmbientColor"), [0.0, 0.5, 0.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vDiffuseColor"), [0.0, 0.5, 0.0, 1.0]);
        this.gl.vertexAttrib4fv(this.gl.getAttribLocation(this.program, "vSpecularColor"), [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib1f(this.gl.getAttribLocation(this.program, "vSpecularExponent"), 1000.0);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mvT.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0 , this.numGrassPoints);
    }
}

function addTarmacPoints():vec4[] {
        return getPlyPoints("TARMAC.txt");
}

function addGrassPoints():vec4[] {
    return getPlyPoints("GRASS.txt");
}
