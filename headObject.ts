"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4, scalem, rotateZ, toradians} from "./helperfunctions.js";
import {geometryGenerator} from "./geometryGenerator.js";


export class headObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;
    bufferId:WebGLBuffer;

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

        this.vColor = this.gl.getAttribLocation(this.program, "vColor");
        this.gl.vertexAttribPointer(this.vColor, 4, this.gl.FLOAT, false, 32, 16);
        this.gl.enableVertexAttribArray(this.vColor);
    }


    draw(mv:mat4){
        this.bindToBuffer();


        //Translations
        mv = mv.mult(scalem(.08, .08, .08));
        mv = mv.mult(rotateY(this.yRotOffset));


        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 10000);
    }


}

function generateHeadPoints():vec4[]{
    let sphereverts:vec4[] = [];
    let subdiv:number = 15;
    let step:number = (360.0 / subdiv)*(Math.PI / 180.0);

    let updown = .4;
    let frontback = .7;
    let sideside = .4;
    addGraySpherePoints(sphereverts, 0, 0, 0, .2, 1);
    addGraySpherePoints(sphereverts, -frontback, updown, -sideside, .95, .25);
    addGraySpherePoints(sphereverts, -frontback, updown, sideside, .95, .25);
    addGraySpherePoints(sphereverts, -.15 - frontback, updown, -sideside, .05, .15);
    addGraySpherePoints(sphereverts, -.15 - frontback, updown, sideside, .05, .15);

    return sphereverts;
}

function addGraySpherePoints(sphereverts:vec4[], x:number, y:number, z:number, c:number, scaler:number){
    let subdiv:number = 15;
    let step:number = (360.0 / subdiv)*(Math.PI / 180.0);

    let max = 0.05;
    let min = -0.05;
    for (let lat:number = 0; lat <= Math.PI ; lat += step){ //latitude
        for (let lon:number = 0; lon + step <= 2*Math.PI; lon += step){ //longitude
            //triangle 1
            let color = new vec4(c + ((Math.random() * (max - min) + min)), c + (Math.random() * (max - min) + min), c + ((Math.random() * (max - min) + min)), 1);
            sphereverts.push(new vec4(x + (Math.sin(lat)*Math.cos(lon)) * scaler, y + (Math.sin(lon)*Math.sin(lat)) * scaler,z + (Math.cos(lat)) * scaler, 1.0));
            sphereverts.push(color); //normal
            sphereverts.push(new vec4(x + (Math.sin(lat)*Math.cos(lon+step)) * scaler, y + (Math.sin(lat)*Math.sin(lon+step)) * scaler, z + (Math.cos(lat)* scaler), 1.0));
            sphereverts.push(color);
            sphereverts.push(new vec4(x + (Math.sin(lat+step)*Math.cos(lon+step)) * scaler, y + (Math.sin(lon+step)*Math.sin(lat+step)) * scaler, z + (Math.cos(lat+step)) * scaler, 1.0));
            sphereverts.push(color);

            //triangle 2
            color = new vec4(c + ((Math.random() * (max - min) + min)), c + (Math.random() * (max - min) + min), c + ((Math.random() * (max - min) + min)), 1);
            sphereverts.push(new vec4(x + (Math.sin(lat+step)*Math.cos(lon+step)) * scaler, y + (Math.sin(lon+step)*Math.sin(lat+step)) * scaler, z + (Math.cos(lat+step)) * scaler, 1.0));
            sphereverts.push(color);
            sphereverts.push(new vec4(x + (Math.sin(lat+step)*Math.cos(lon)) * scaler, y + (Math.sin(lat+step)*Math.sin(lon)) * scaler, z + (Math.cos(lat+step)) * scaler, 1.0));
            sphereverts.push(color);
            sphereverts.push(new vec4(x + (Math.sin(lat)*Math.cos(lon)) * scaler, y + (Math.sin(lon)*Math.sin(lat)) * scaler, z + (Math.cos(lat)) * scaler, 1.0));
            sphereverts.push(color);
        }
    }
}
