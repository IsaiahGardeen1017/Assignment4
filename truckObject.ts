"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2, scalem} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {headObject} from "./headObject.js";
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


    airdrag:number = 25; //Coefficient applied to air resistance force (Scales quadratically)
    roaddrag:number = 2; //Coefficient applied to rolling resistance (Scales Linearly)

    horsePower:number = 5; //Coefficient applied to engineForce
    breakpower:number = 5; //Coefficient applied to brakeForce

    gasPedal:number = 0;
    brakePedal:number = 0;
    steeringWheel:number = 0;
    gasPedalSpeed:number = .03;
    brakePedalSpeed:number = .03;
    steeringWheelSpeed:number = .05;
    turnRadius:number = 15;

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
        this.frontWheel = new wheelObject(gl, program, true);
        this.rearWheel = new wheelObject(gl, program, false);
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

        let turnR:number = this.turnRadius;

        if(this.dir[0] < 0){//reverse
            turnR = -turnR;
        }
        this.yrot += (this.velocity.mag() * this.steeringWheel * turnR);


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


    draw(drawHead:boolean){
        let mv:mat4 = this.cam.look();
        let lightPosition:mat4 = mv;
        mv = mv.mult(translate(this.xoffset,this.yoffset, this.zoffset));
        mv = mv.mult(rotateY(this.yrot));

        //Draw the head
        if(drawHead) {
            this.head.draw(mv.mult(translate(.1, 0, 0)));//Where the head is in relation to the truck
        }

        //Draw the wheels
        let wheelrot:number = this.realVelocity.mag() * this.dir[0];
        let wheelHight:number = -0.15;
        let frontWheelDistance:number = 0.75;
        let rearWheelDistance:number = -0.85;
        let wheelWidth:number = -.4;
        //The 180 rotation rotates it so the wheels face out
        this.frontWheel.spin(wheelrot);
        this.frontWheel.draw(1, this.steeringWheel, mv.mult(translate(frontWheelDistance, wheelHight, wheelWidth)).mult(rotateY(180)));
        this.frontWheel.draw(-1, this.steeringWheel, mv.mult(translate(frontWheelDistance, wheelHight, -wheelWidth)));
        this.rearWheel.spin(wheelrot);
        this.rearWheel.draw(1, 0, mv.mult(translate(rearWheelDistance, wheelHight, wheelWidth)).mult(rotateY(180)));
        this.rearWheel.draw(-1, 0, mv.mult(translate(rearWheelDistance, wheelHight, -wheelWidth)));

        //Truck only transformations
        let scaler:number = 0.01;//scale size of truck body
        mv = mv.mult(scalem(scaler,scaler,scaler,));
        mv = mv.mult(rotateX(90));
        mv = mv.mult(rotateY(180));

        //Draw the Chasis
        this.bindToBuffer();

        let vAmbientDiffuseColor = this.gl.getAttribLocation(this.program, "vAmbientDiffuseColor");
        let vSpecularColor:GLint = this.gl.getAttribLocation(this.program, "vSpecularColor");
        let vSpecularExponent:GLint = this.gl.getAttribLocation(this.program, "vSpecularExponent");
        let light_position:WebGLUniformLocation = this.gl.getUniformLocation(this.program, "light_position");
        let light_color:WebGLUniformLocation = this.gl.getUniformLocation(this.program, "light_color");
        let ambient_light:WebGLUniformLocation = this.gl.getUniformLocation(this.program, "ambient_light");

        this.gl.vertexAttrib4fv(vAmbientDiffuseColor, [.5, 0, 0, 1]);
        this.gl.vertexAttrib4fv(vSpecularColor, [1.0, 1.0, 1.0, 1.0]);
        this.gl.vertexAttrib1f(vSpecularExponent, 30.0);
        this.gl.uniform4fv(light_position, lightPosition.mult(new vec4(50, 50, 50, 1)).flatten());
        this.gl.uniform4fv(light_color, [1, 1, 1, 1]);
        this.gl.uniform4fv(ambient_light, [.5, .5, .5, 5]);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numPoints);
    }
}

//TODO I used to think that racism isn't a big issue anymore and that it was an individual thing.

function addTruckPoints():vec4[]{
    return getPlyPoints("CHASIS.txt");
}
