"use strict";

import {flatten, lookAt, mat4, rotateY, translate, vec4, scalem, rotateZ, toradians} from "./helperfunctions.js";
import {geometryGenerator} from "./geometryGenerator.js";


export class wheelObject{
    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;
    bufferId:WebGLBuffer;

    zRotOffset:number = 0;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();


        //Set Geometry
        this.bindToBuffer();
        let points:vec4[];
        points = generateWheelPoints();
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


    draw(zrot:number, steeringWheel:number, mv:mat4){
        this.bindToBuffer();

        let rotSpeed:number = 90; //Guess, could do math to figure out exactly but this isn't a physics class
        let maxTurnAngle:number = 15; //Determines how far the wheels turn (also a guess)
        this.zRotOffset += (zrot * rotSpeed);

        //Translations
        mv = mv.mult(scalem(.08, .08, .08));
        mv = mv.mult(rotateY(steeringWheel * maxTurnAngle));
        mv = mv.mult(rotateZ(this.zRotOffset));


        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 1000);    // draw the truck
    }


}

function generateWheelPoints():vec4[]{

    //Rubber
    let gg1:geometryGenerator = new geometryGenerator();
    let rubberThickness:number = 0.4;
    let rubberDiameter:number = 1;
    for(let i:number = 0; i <= 11; i++){
        gg1.addVertex(i, rubberDiameter * Math.cos(toradians(i*30)), rubberDiameter * Math.sin(toradians(i * 30)), rubberThickness);
    }
    for(let i:number = 0; i <= 11; i++){
        gg1.addVertex(i + 12, rubberDiameter * Math.cos(toradians(i*30)), rubberDiameter * Math.sin(toradians(i * 30)), -rubberThickness);
    }
    gg1.addVertex(24, 0,0,rubberThickness);
    gg1.addVertex(25, 0,0,-rubberThickness);

    let rubberColor:vec4 = new vec4(0.1,0.1,0.1,1);
    for(let i:number = 0; i <= 11; i++){
        gg1.addTriangle(24, (i+1)%12, i, rubberColor);
        gg1.addTriangle(25, ((i+1)%12) + 12, i + 12, rubberColor);
    }

    rubberColor = new vec4(0.05, 0.05, 0.05, 1);
    for(let i:number = 0; i <= 11; i++) {
        gg1.addTriangle((i+1)%12, ((i+1)%12) + 12, i, rubberColor);
        gg1.addTriangle(i, ((i+1)%12) + 12, i+12, rubberColor);
    }


    //Rim
    let gg2:geometryGenerator = new geometryGenerator();
    let rimThickness:number = 0.41;
    let rimDiameter:number = 0.66;
    let rimColor:vec4 = new vec4(0.75,0.75,0.75,1);
    let blackColor:vec4 = new vec4(0,0,0,1);
    for(let i:number = 0; i <= 11; i++){
        gg2.addVertex(i, rimDiameter * Math.cos(toradians(i*30)), rimDiameter * Math.sin(toradians(i * 30)), rimThickness);
    }
    for(let i:number = 0; i <= 11; i++){
        gg2.addVertex(i + 12, rimDiameter * Math.cos(toradians(i*30)), rimDiameter * Math.sin(toradians(i * 30)), -rimThickness);
    }
    gg2.addVertex(24, 0,0,rimThickness);
    gg2.addVertex(25, 0,0,-rimThickness);

    for(let i:number = 0; i <= 11; i++){
        let color:vec4 = rimColor;
        if(i%2 == 0){
            color = blackColor;
        }
        gg2.addTriangle(24, (i+1)%12, i, color);
        gg2.addTriangle(25, ((i+1)%12) + 12, i + 12, color);
    }

    for(let i:number = 0; i <= 11; i++) {
        gg2.addTriangle((i+1)%12, ((i+1)%12) + 12, i, rimColor);
        gg2.addTriangle(i, ((i+1)%12) + 12, i+12, rimColor);
    }

    //HubCap
    let gg3:geometryGenerator = new geometryGenerator();
    let hubcapThickness:number = 0.42;
    let hubcapDiameter:number = 0.4;
    rimColor = new vec4(.6,.6,.6,1)
    for(let i:number = 0; i <= 11; i++){
        gg3.addVertex(i, hubcapDiameter * Math.cos(toradians(i*30)), hubcapDiameter * Math.sin(toradians(i * 30)), hubcapThickness);
    }
    for(let i:number = 0; i <= 11; i++){
        gg3.addVertex(i + 12, hubcapDiameter * Math.cos(toradians(i*30)), hubcapDiameter * Math.sin(toradians(i * 30)), -hubcapThickness);
    }
    gg3.addVertex(24, 0,0,hubcapThickness);
    gg3.addVertex(25, 0,0,-hubcapThickness);

    for(let i:number = 0; i <= 11; i++){
        let color:vec4 = rimColor;
        if(i%2 == 0){
            color = blackColor;
        }
        gg3.addTriangle(24, (i+1)%12, i, rimColor);
        gg3.addTriangle(25, ((i+1)%12) + 12, i + 12, rimColor);
    }

    for(let i:number = 0; i <= 11; i++) {
        gg3.addTriangle((i+1)%12, ((i+1)%12) + 12, i, rimColor);
        gg3.addTriangle(i, ((i+1)%12) + 12, i+12, rimColor);
    }

    //return gg3.getTrianglePoints();
    return gg1.getTrianglePoints().concat(gg2.getTrianglePoints()).concat(gg3.getTrianglePoints());
}

