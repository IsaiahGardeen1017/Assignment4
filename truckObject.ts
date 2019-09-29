"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";

export class truckObject{

    velocity:vec4 = new vec4(0,0,0,0);
    engineForce:vec4 = new vec4(0,0,0,0);
    brakeForce:vec4 = new vec4(0,0,0,0);
    dir:vec4 = new vec4(1,0,0,0);

    mass:number = 1500;

    brakeDelay:number = 60;
    lastZeroSpeedTick:number = 0;


    airdrag:number = 50;
    roaddrag:number = 10;

    horsePower:number = 3;
    breakpower:number = 5;

    gasPedal:number = 0;
    brakePedal:number = 0;
    steeringWheel:number = 0;
    gasPedalSpeed:number = .03;
    brakePedalSpeed:number = .03;
    steeringWheelSpeed:number = .03;



    xoffset:number = 0;
    yoffset:number = 0;
    zoffset:number = 0;
    yrot:number = 0;
    zrot:number = 0;





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
        this.frontWheel = new wheelObject(gl, program);
        this.rearWheel = new wheelObject(gl, program);
        //Set Geometry
        this.bindToBuffer();
        let points: vec4[] = [];
        addTruckPoints(points);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
    }

    tick(){
        if(this.gasPedal >= 1){
            this.gasPedal = 1 - this.gasPedalSpeed;
        }else if(this.gasPedal <= 0){
            this.gasPedal = 0;
        }else{
            this.gasPedal -= this.gasPedalSpeed;
        }

        if(this.brakePedal >= 1){
            this.brakePedal = 1 - this.brakePedalSpeed;
        }else if(this.brakePedal <= 0){
            this.brakePedal = 0;
        }else{
            this.brakePedal -= this.brakePedalSpeed;
        }

        if(this.steeringWheel >= 1){
            this.steeringWheel = 1 - this.steeringWheelSpeed;
        }else if(this.steeringWheel <= -1){
            this.steeringWheel = -1 + this.steeringWheelSpeed;
        }else if(this.steeringWheel < this.steeringWheelSpeed * 2 && this.steeringWheel > this.steeringWheelSpeed * -2){
            this.steeringWheel = 0;
        }else if(this.steeringWheel > 0){
            this.steeringWheel -= this.steeringWheelSpeed;
        }else{
            this.steeringWheel += this.steeringWheelSpeed;
        }




        this.engineForce = this.dir.scale(this.gasPedal);
        this.brakeForce = this.dir.scale(-this.brakePedal);

        this.yrot += 25 * this.velocity.mag() * this.steeringWheel;


        let dragForce:vec4 = this.velocity.scale(-this.airdrag).scale(this.velocity.mag());
        let roadForce:vec4 = this.velocity.scale(-this.roaddrag)
        let brakingForce:vec4 = this.brakeForce.scale(this.breakpower);

        if(this.velocity[0] <= 0){
            brakingForce = new vec4(0,0,0,0);
        }

        if(this.velocity.mag() <= 0.001){
            brakingForce = new vec4(0,0,0,0);
            this.velocity = new vec4(0,0,0,0);
        }

        let totalForce:vec4 = this.engineForce.scale(this.horsePower).add(dragForce).add(roadForce).add(brakingForce);
        //let accel:vec4 = rotateY(this.yrot).mult(totalForce.scale(1/this.mass)); //maybe use this for lockup
        let accel:vec4 = (totalForce.scale(1/this.mass));
        this.velocity = this.velocity.add(accel);
        //rotate vector
        let realvelocity:vec4 = rotateY(this.yrot).mult(this.velocity);
        this.xoffset = this.xoffset + realvelocity[0];
        this.yoffset = this.yoffset + realvelocity[1];
        this.zoffset = this.zoffset + realvelocity[2];


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
        let mv:mat4 = lookAt(new vec4(0, 2, 5, 1), new vec4(0,0,0,1), new vec4(0,1,0,0));

        //Translations
        mv = mv.mult(translate(0,.17,0));
        //mv = mv.mult(rotateY());
        mv = mv.mult(translate(this.xoffset,this.yoffset, this.zoffset));
        mv = mv.mult(rotateY(180 + this.yrot));
        mv = mv.mult(rotateZ(this.zrot));



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