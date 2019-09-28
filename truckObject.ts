"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";

export class truckObject{
    tXpos:number;
    tZpos:number;
    tYpos:number;

    tYrot:number;


    sliderValue:number;


    frontWheel:wheelObject;
    rearWheel:wheelObject;

    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;


    bufferId:WebGLBuffer;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();

        this.tXpos = 0;
        this.tZpos = 0;
        this.tYpos = 0;

        this.tYrot = 0;

        this.sliderValue = 0;

        this.frontWheel = new wheelObject(gl, program);
        this.rearWheel = new wheelObject(gl, program);

        //Set Geometry
        this.bindToBuffer();
        let points: vec4[] = [];
        addTruckPoints(points);
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
        mv = mv.mult(translate(0,.5,0));
        mv = mv.mult(rotateY(ticks));
        mv = mv.mult(translate(this.tXpos,this.tYpos, this.tZpos));
        mv = mv.mult(rotateY(-4 * ticks));


        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 156);    // draw the truck

        //Draw the wheel
        this.frontWheel.draw(ticks, mv.mult(translate(-.25, -.07, .18)));
        this.frontWheel.draw(ticks, mv.mult(translate(-.25, -.07, -.18)));

        this.rearWheel.draw(ticks, mv.mult(translate(.4, -.07, .18)));
        this.rearWheel.draw(ticks, mv.mult(translate(.4, -.07, -.18)));
    }


}

function addTruckPoints(points) {


    let color:vec4;

    //Left Side
    color = new vec4(0.8,0.8,0.8,1.0);
    points.push(new vec4(0.18,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.18,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.67,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));



    //Right Side
    color = new vec4(0.8,0.8,0.8,1.0);
    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));


    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.67,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    //Top sides (Hood, roof, top of bed)
    color = new vec4(1.0,1.0,1.0,1.0);
    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.67,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.67,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));



    //Windshield
    color = new vec4(0.1,0.1,0.1,1.0);
    points.push(new vec4(-0.03,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.2,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.03,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.2,0.1,0.18,1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));


    //Grill

    color = new vec4(0.4,0.4,0.4,1.0);
    points.push(new vec4(-0.44,0.06,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,0.06,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));



    //tailgate
    color = new vec4(0.1,0.1,0.1,1.0);
    points.push(new vec4(0.18,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.18,0.2,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.18,0.2,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    //Rear windshield
    color = new vec4(0.9,0.9,0.9,1.0);
    points.push(new vec4(0.67,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(0.67,0.1,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,0.1,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    //Bottom
    color = new vec4(0.2,0.2,0.2,1.0);
    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(-0.44,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));

    points.push(new vec4(-0.44,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    points.push(new vec4(0.67,-0.08,-0.18, 1));
    points.push(new vec4(color[0], color[1], color[2], color[3]));
    /*
    */
}