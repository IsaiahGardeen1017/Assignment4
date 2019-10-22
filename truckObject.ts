"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2, scalem} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {headObject} from "./headObject.js";
import {geometryGenerator, expandGeometry} from "./geometryGenerator.js";
import {getPlyPoints} from "./PlyReader.js";
import {camera} from "./camera";

export class truckObject{
    realVelocity:vec4 = new vec4(0,0,0,0); //What the truck actually moves


    //Directions of the following in relation to the truck body (only in x direction, can probably not use vec4)
    velocity:vec4 = new vec4(0,0,0,0);
    engineForce:vec4 = new vec4(0,0,0,0);
    brakeForce:vec4 = new vec4(0,0,0,0);
    dir:vec4 = new vec4(1,0,0,0);//TODO see if i can delete

    mass:number = 1500;


    airdrag:number = 50; //Coefficient applied to engineForce
    roaddrag:number = 5; //Coefficient applied to rolling resistance

    horsePower:number = 1; //Coefficient applied to engineForce
    breakpower:number = 5; //Coefficient applied to brakeForce

    gasPedal:number = 0;
    brakePedal:number = 0;
    steeringWheel:number = 0;
    gasPedalSpeed:number = .03;
    brakePedalSpeed:number = .03;
    steeringWheelSpeed:number = .05;

    funmode:boolean = true;

    xoffset:number = 0;
    yoffset:number = 0;
    zoffset:number = 0;
    yrot:number = 0;//yrotational offset
    zrot:number = 0;

    frontWheel:wheelObject;
    rearWheel:wheelObject;
    head:headObject;

    cam:camera;

    program:WebGLProgram;
    gl:WebGLRenderingContext;
    vPosition:GLint;
    vColor:GLint;

    numPoints:number;

    bufferId:WebGLBuffer;

    constructor(gl:WebGLRenderingContext, program:WebGLProgram, cam:camera){
        this.gl = gl;
        this.program = program;
        this.bufferId = this.gl.createBuffer();
        this.frontWheel = new wheelObject(gl, program);
        this.rearWheel = new wheelObject(gl, program);
        this.head = new headObject(gl, program);
        this.cam = cam;
        //Set Geometry
        this.bindToBuffer();
        let points: vec4[] = addTruckPoints();
        this.numPoints = points.length;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
    }

    //Updates every frame
    update(){
        //Handles moving of the gas pedal
        if(this.gasPedal >= 1){
            this.gasPedal = 1 - this.gasPedalSpeed;
        }else if(this.gasPedal <= 0){
            this.gasPedal = 0;
        }else if(this.funmode){
            this.gasPedal -= this.gasPedalSpeed;
        }

        //Handles moving of the brake pedal
        if(this.brakePedal >= 1){
            this.brakePedal = 1 - this.brakePedalSpeed;
        }else if(this.brakePedal <= 0){
            this.brakePedal = 0;
        }else if(this.funmode){
            this.brakePedal -= this.brakePedalSpeed;
        }

        //Handles moving of the steering wheel
        if(this.steeringWheel >= 1){
            this.steeringWheel = 1 - this.steeringWheelSpeed;
        }else if(this.steeringWheel <= -1){
            this.steeringWheel = -1 + this.steeringWheelSpeed;
        }else if(this.steeringWheel < this.steeringWheelSpeed * 2 && this.steeringWheel > this.steeringWheelSpeed * -2){
            this.steeringWheel = 0;
        }else if(this.steeringWheel > 0 && this.funmode){
            this.steeringWheel -= this.steeringWheelSpeed;
        }else if(this.funmode){
            this.steeringWheel += this.steeringWheelSpeed;
        }

        this.engineForce = this.dir.scale(this.gasPedal);
        this.brakeForce = this.dir.scale(-this.brakePedal);

        //Handles amount of turning the truck does (both visually and change in velocity direction)
        let turnRadius:number = 1.5;
        if(this.dir[0] < 0){//reverse
            turnRadius = -2;
        }
        this.yrot += (25 * this.velocity.mag() * this.steeringWheel) * turnRadius;


        //Forces acting against the truck (Top speed is a result of this)
        let dragForce:vec4 = this.velocity.scale(-this.airdrag).scale(this.velocity.mag());
        let roadForce:vec4 = this.velocity.scale(-this.roaddrag);
        let brakingForce:vec4 = this.brakeForce.scale(this.breakpower);


        //Prevent braking form moving the truck backwards, set velocity to zero at really low speeds
        if(this.funmode) {
            if (this.velocity[0] * this.dir[0] <= 0) {
                brakingForce = new vec4(0, 0, 0, 0);
            }
            if (this.velocity.mag() <= 0.0001) {
                brakingForce = new vec4(0, 0, 0, 0);
            }
            if (this.velocity.mag() <= 0.0001) {
                this.velocity = new vec4(0, 0, 0, 0);
            }
        }

        //Total amount of force acting on the car
        let totalForce:vec4 = this.engineForce.scale(this.horsePower).add(dragForce).add(roadForce).add(brakingForce);

        //let accel:vec4 = rotateY(this.yrot).mult(totalForce.scale(1/this.mass)); //maybe use this for lockup
        let accel:vec4 = (totalForce.scale(1/this.mass));
        this.velocity = this.velocity.add(accel);

        //calculate real velocity (direction)
        this.realVelocity = rotateY(this.yrot).mult(this.velocity);
        //Set the posistion offsets
        this.xoffset = this.xoffset + this.realVelocity[0];
        this.yoffset = this.yoffset + this.realVelocity[1];
        this.zoffset = this.zoffset + this.realVelocity[2];
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
        let mv:mat4 = this.cam.look();
        mv = mv.mult(translate(0,0,0));
        mv = mv.mult(translate(this.xoffset,this.yoffset, this.zoffset));
        mv = mv.mult(rotateY(this.yrot + 180));

        //Draw the head
        this.head.draw(mv.mult(translate(.1, 0, 0)));//Where the head is in relation to the truck


        //Draw the wheels
        let wheelrot:number = this.realVelocity.mag() * this.dir[0];
        let wheelHight:number = -0.22;
        let frontWheel:number = -.25;
        let rearWheel:number = 0.75;
        let wheelWidth:number = -.4;
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(frontWheel, wheelHight, wheelWidth)));
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(frontWheel, wheelHight, -wheelWidth)));

        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(rearWheel, wheelHight, wheelWidth)));
        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(rearWheel, wheelHight, -wheelWidth)));

        //Truck only transformations
        let scaler:number = 0.01;//scale size of truck body
        mv = mv.mult(scalem(scaler,scaler,scaler,));
        mv = mv.mult(rotateX(-90));

        //Draw the truck
        this.bindToBuffer();
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);
    }
}


function addTruckPoints():vec4[]{
    return getPlyPoints("FinalF1.txt");
}
