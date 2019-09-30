"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {geometryGenerator, expandGeometry} from "./geometryGenerator.js";

export class truckObject{
    realVelocity:vec4 = new vec4(0,0,0,0); //What the truck actually moves


    //Directions of the following in relation to the truck body (only in x direction, can probably not use vec4)
    velocity:vec4 = new vec4(0,0,0,0);
    engineForce:vec4 = new vec4(0,0,0,0);
    brakeForce:vec4 = new vec4(0,0,0,0);
    dir:vec4 = new vec4(1,0,0,0);//TODO see if i can delete

    mass:number = 1500;


    airdrag:number = 50; //Coefficient applied to engineForce
    roaddrag:number = 10; //Coefficient applied to rolling resistance

    horsePower:number = 3; //Coefficient applied to engineForce
    breakpower:number = 5; //Coefficient applied to brakeForce

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
        let points: vec4[] = addTruckPoints();
        //alert(points.length);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(points), this.gl.STATIC_DRAW);
    }

    //Updates every frame
    tick(){
        //Handles moving of the gas pedal
        if(this.gasPedal >= 1){
            this.gasPedal = 1 - this.gasPedalSpeed;
        }else if(this.gasPedal <= 0){
            this.gasPedal = 0;
        }else{
            this.gasPedal -= this.gasPedalSpeed;
        }

        //Handles moving of the brake pedal
        if(this.brakePedal >= 1){
            this.brakePedal = 1 - this.brakePedalSpeed;
        }else if(this.brakePedal <= 0){
            this.brakePedal = 0;
        }else{
            this.brakePedal -= this.brakePedalSpeed;
        }

        //Handles moving of the steering wheel
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


        //Handles amount of turning the truck does (both visually and change in velocity direction)
        let turnRadius:number = 1;
        if(this.dir[0] < 0){
            turnRadius = -1.5;
        }
        this.yrot += (25 * this.velocity.mag() * this.steeringWheel) * turnRadius;


        //Forces acting against the truck (Top speed is a result of this)
        let dragForce:vec4 = this.velocity.scale(-this.airdrag).scale(this.velocity.mag());
        let roadForce:vec4 = this.velocity.scale(-this.roaddrag);
        let brakingForce:vec4 = this.brakeForce.scale(this.breakpower);


        //Prevent braking form moving the truck backwards, set velocity to zero at really low speeds
        if(this.velocity[0] * this.dir[0]  <= 0){
            brakingForce = new vec4(0,0,0,0);
        }
        if(this.velocity.mag() <= 0.001){
            brakingForce = new vec4(0,0,0,0);
            this.velocity = new vec4(0,0,0,0);
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
        this.bindToBuffer();
        let mv:mat4 = lookAt(new vec4(0, 2, 5, 1), new vec4(0,0,0,1), new vec4(0,1,0,0));

        //Translations
        mv = mv.mult(translate(0,.17,0));
        //mv = mv.mult(rotateY());
        mv = mv.mult(translate(this.xoffset,this.yoffset, this.zoffset));
        mv = mv.mult(rotateY(180 + this.yrot));




        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 156);    // draw the truck

        //Draw the wheel
        let wheelrot:number = this.realVelocity.mag() * this.dir[0];
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(-.25, -.07, .17)));
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(-.25, -.07, -.17)));

        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(.4, -.07, .17)));
        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(.4, -.07, -.17)));
    }
}

function addTruckPoints():vec4[]{

    //sides
    let gg:geometryGenerator = new geometryGenerator();
    gg.addVertex(0,-0.03,0.2,-0.025);//Roof left
    gg.addVertex(1,0.15,0.2,-0.025);//Roof Right
    gg.addVertex(2,0.15,0.1,0);
    gg.addVertex(3,0.67,0.1,0);//Bed Top Right
    gg.addVertex(4,0.67,-0.08,0);//Bottom Right
    gg.addVertex(5,-0.44,-0.08,0);//Bottom Left
    gg.addVertex(6,-0.44,0.06,0);
    gg.addVertex(7,-0.2,0.1,0);


    let sideColor:vec4 = new vec4(0.8,0.8,0.8,1.0);
    gg.addTriangle(7, 1,0,sideColor);
    gg.addTriangle(7,2,1,sideColor);
    gg.addTriangle(4,3,2,sideColor);
    gg.addTriangle(7,4,2,sideColor);
    gg.addTriangle(5,4,7,sideColor);
    gg.addTriangle(5,7,6,sideColor);

    let connectorColor = new vec4(.7,.7,.7,1);
    //return gg.getTrianglePoints();
    return expandGeometry(.36, gg, connectorColor);


}

function YeetaddTruckPoints():vec4[] {

    let points:vec4[] = [];
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
    color = new vec4(0.1,0.1,0.1,1);
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
    return points;
}