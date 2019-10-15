"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2, scalem} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {headObject} from "./headObject.js";
import {geometryGenerator, expandGeometry} from "./geometryGenerator.js";
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
    steeringWheelSpeed:number = .01;

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
        //alert(points.length);
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
        this.bindToBuffer();
        let mv:mat4 = this.cam.look();

        //Translations
        //mv = mv.mult(scalem(0.01,0.01,0.01));

        mv = mv.mult(translate(0,0.32,0));
        //mv = mv.mult(rotateY());
        mv = mv.mult(translate(this.xoffset,this.yoffset, this.zoffset));
        mv = mv.mult(rotateY(this.yrot + 180));

        let scaler:number = 1.5;//scale size of truck body
        mv = mv.mult(scalem(scaler,scaler,scaler,));


        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "model_view"), false, mv.flatten());
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 10000);    // draw the truck

        mv = mv.mult(scalem(1/scaler, 1/scaler, 1/scaler));//We dont want to scale the wheels and head, we do that sperately

        //Draw the head
        this.head.draw(mv.mult(translate(-.275, -.165, 0)));//Where the head is in relation to the truck


        //Draw the wheel
        let wheelrot:number = this.realVelocity.mag() * this.dir[0];
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(-.13, -.22, .17)));
        this.frontWheel.draw(wheelrot, this.steeringWheel, mv.mult(translate(-.13, -.22, -.17)));

        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(.59, -.22, .17)));
        this.rearWheel.draw(wheelrot, 0, mv.mult(translate(.59, -.22, -.17)));


    }
}


function addTruckPoints():vec4[]{
    let gg = new geometryGenerator();

    gg.addVertex(	0	,	0.530	,	-0.037	,	0.13	);
    gg.addVertex(	1	,	0.530	,	-0.117	,	0.13	);
    gg.addVertex(	2	,	0.450	,	-0.117	,	0.13	);
    gg.addVertex(	3	,	0.450	,	-0.090	,	0.13	);
    gg.addVertex(	4	,	0.330	,	-0.090	,	0.13	);
    gg.addVertex(	5	,	0.330	,	-0.117	,	0.13	);
    gg.addVertex(	6	,	-0.030	,	-0.117	,	0.13	);
    gg.addVertex(	7	,	-0.030	,	-0.090	,	0.13	);
    gg.addVertex(	8	,	-0.150	,	-0.090	,	0.13	);
    gg.addVertex(	9	,	-0.150	,	-0.117	,	0.13	);
    gg.addVertex(	10	,	-0.197	,	-0.117	,	0.13	);
    gg.addVertex(	11	,	-0.197	,	-0.057	,	0.13	);
    gg.addVertex(	12	,	-0.030	,	-0.037	,	0.13	);
    gg.addVertex(	13	,	0.077	,	0.037	,	0.13	);
    gg.addVertex(	14	,	0.190	,	0.037	,	0.13	);
    gg.addVertex(	15	,	0.197	,	-0.037	,	0.13	);
    gg.addVertex(	16	,	0.323	,	-0.157	,	0.11	);
    gg.addVertex(	17	,	-0.017	,	-0.157	,	0.11	);
    gg.addVertex(	18	,	0.457	,	-0.157	,	0.11	);
    gg.addVertex(	19	,	0.517	,	-0.157	,	0.11	);
    gg.addVertex(	20	,	-0.150	,	-0.157	,	0.11	);
    gg.addVertex(	21	,	-0.217	,	-0.157	,	0.11	);
    gg.addVertex(	22	,	-0.217	,	-0.117	,	0.13	);
    gg.addVertex(	23	,	-0.003	,	-0.037	,	0.13	);
    gg.addVertex(	24	,	0.143	,	-0.037	,	0.13	);
    gg.addVertex(	25	,	0.143	,	0.030	,	0.13	);
    gg.addVertex(	26	,	0.083	,	0.030	,	0.13	);
    gg.addVertex(	27	,	0.197	,	-0.090	,	0.13	);
    gg.addVertex(	28	,	0.530	,	-0.090	,	0.13	);


    gg.addVertex(	29	,	0.530	,	-0.037	,	0.11	);
    gg.addVertex(	30	,	0.530	,	-0.117	,	0.11	);
    gg.addVertex(	31	,	0.450	,	-0.117	,	0.11	);
    gg.addVertex(	32	,	0.450	,	-0.090	,	0.11	);
    gg.addVertex(	33	,	0.330	,	-0.090	,	0.11	);
    gg.addVertex(	34	,	0.330	,	-0.117	,	0.11	);
    gg.addVertex(	35	,	-0.030	,	-0.117	,	0.11	);
    gg.addVertex(	36	,	-0.030	,	-0.090	,	0.11	);
    gg.addVertex(	37	,	-0.150	,	-0.090	,	0.11	);
    gg.addVertex(	38	,	-0.150	,	-0.117	,	0.11	);
    gg.addVertex(	39	,	-0.197	,	-0.117	,	0.11	);
    gg.addVertex(	40	,	-0.197	,	-0.057	,	0.11	);
    gg.addVertex(	41	,	-0.030	,	-0.037	,	0.11	);
    gg.addVertex(	42	,	0.077	,	0.037	,	0.11	);
    gg.addVertex(	43	,	0.190	,	0.037	,	0.11	);
    gg.addVertex(	44	,	0.197	,	-0.037	,	0.11	);
    gg.addVertex(	45	,	0.323	,	-0.157	,	0.11	);
    gg.addVertex(	46	,	-0.017	,	-0.157	,	0.11	);
    gg.addVertex(	47	,	0.457	,	-0.157	,	0.11	);
    gg.addVertex(	48	,	0.517	,	-0.157	,	0.11	);
    gg.addVertex(	49	,	-0.150	,	-0.157	,	0.11	);
    gg.addVertex(	50	,	-0.217	,	-0.157	,	0.11	);
    gg.addVertex(	51	,	-0.217	,	-0.117	,	0.11	);
    gg.addVertex(	52	,	-0.003	,	-0.037	,	0.11	);
    gg.addVertex(	53	,	0.143	,	-0.037	,	0.11	);
    gg.addVertex(	54	,	0.143	,	0.030	,	0.11	);
    gg.addVertex(	55	,	0.083	,	0.030	,	0.11	);
    gg.addVertex(	56	,	0.197	,	-0.090	,	0.11	);
    gg.addVertex(	57	,	0.530	,	-0.090	,	0.11	);


    gg.addVertex(	58	,	0.530	,	-0.037	,	-0.13	);
    gg.addVertex(	59	,	0.530	,	-0.117	,	-0.13	);
    gg.addVertex(	60	,	0.450	,	-0.117	,	-0.13	);
    gg.addVertex(	61	,	0.450	,	-0.090	,	-0.13	);
    gg.addVertex(	62	,	0.330	,	-0.090	,	-0.13	);
    gg.addVertex(	63	,	0.330	,	-0.117	,	-0.13	);
    gg.addVertex(	64	,	-0.030	,	-0.117	,	-0.13	);
    gg.addVertex(	65	,	-0.030	,	-0.090	,	-0.13	);
    gg.addVertex(	66	,	-0.150	,	-0.090	,	-0.13	);
    gg.addVertex(	67	,	-0.150	,	-0.117	,	-0.13	);
    gg.addVertex(	68	,	-0.197	,	-0.117	,	-0.13	);
    gg.addVertex(	69	,	-0.197	,	-0.057	,	-0.13	);
    gg.addVertex(	70	,	-0.030	,	-0.037	,	-0.13	);
    gg.addVertex(	71	,	0.077	,	0.037	,	-0.13	);
    gg.addVertex(	72	,	0.190	,	0.037	,	-0.13	);
    gg.addVertex(	73	,	0.197	,	-0.037	,	-0.13	);
    gg.addVertex(	74	,	0.323	,	-0.157	,	-0.11	);
    gg.addVertex(	75	,	-0.017	,	-0.157	,	-0.11	);
    gg.addVertex(	76	,	0.457	,	-0.157	,	-0.11	);
    gg.addVertex(	77	,	0.517	,	-0.157	,	-0.11	);
    gg.addVertex(	78	,	-0.150	,	-0.157	,	-0.11	);
    gg.addVertex(	79	,	-0.217	,	-0.157	,	-0.11	);
    gg.addVertex(	80	,	-0.217	,	-0.117	,	-0.13	);
    gg.addVertex(	81	,	-0.003	,	-0.037	,	-0.13	);
    gg.addVertex(	82	,	0.143	,	-0.037	,	-0.13	);
    gg.addVertex(	83	,	0.143	,	0.030	,	-0.13	);
    gg.addVertex(	84	,	0.083	,	0.030	,	-0.13	);
    gg.addVertex(	85	,	0.197	,	-0.090	,	-0.13	);
    gg.addVertex(	86	,	0.530	,	-0.090	,	-0.13	);


    gg.addVertex(	87	,	0.530	,	-0.037	,	-0.11	);
    gg.addVertex(	88	,	0.530	,	-0.117	,	-0.11	);
    gg.addVertex(	89	,	0.450	,	-0.117	,	-0.11	);
    gg.addVertex(	90	,	0.450	,	-0.090	,	-0.11	);
    gg.addVertex(	91	,	0.330	,	-0.090	,	-0.11	);
    gg.addVertex(	92	,	0.330	,	-0.117	,	-0.11	);
    gg.addVertex(	93	,	-0.030	,	-0.117	,	-0.11	);
    gg.addVertex(	94	,	-0.030	,	-0.090	,	-0.11	);
    gg.addVertex(	95	,	-0.150	,	-0.090	,	-0.11	);
    gg.addVertex(	96	,	-0.150	,	-0.117	,	-0.11	);
    gg.addVertex(	97	,	-0.197	,	-0.117	,	-0.11	);
    gg.addVertex(	98	,	-0.197	,	-0.057	,	-0.11	);
    gg.addVertex(	99	,	-0.030	,	-0.037	,	-0.11	);
    gg.addVertex(	100	,	0.077	,	0.037	,	-0.11	);
    gg.addVertex(	101	,	0.190	,	0.037	,	-0.11	);
    gg.addVertex(	102	,	0.197	,	-0.037	,	-0.11	);
    gg.addVertex(	103	,	0.323	,	-0.157	,	-0.11	);
    gg.addVertex(	104	,	-0.017	,	-0.157	,	-0.11	);
    gg.addVertex(	105	,	0.457	,	-0.157	,	-0.11	);
    gg.addVertex(	106	,	0.517	,	-0.157	,	-0.11	);
    gg.addVertex(	107	,	-0.150	,	-0.157	,	-0.11	);
    gg.addVertex(	108	,	-0.217	,	-0.157	,	-0.11	);
    gg.addVertex(	109	,	-0.217	,	-0.117	,	-0.11	);
    gg.addVertex(	110	,	-0.003	,	-0.037	,	-0.11	);
    gg.addVertex(	111	,	0.143	,	-0.037	,	-0.11	);
    gg.addVertex(	112	,	0.143	,	0.030	,	-0.11	);
    gg.addVertex(	113	,	0.083	,	0.030	,	-0.11	);
    gg.addVertex(	114	,	0.197	,	-0.090	,	-0.11	);
    gg.addVertex(	115	,	0.530	,	-0.090	,	-0.11	);








    //Colors
    let sidePaintColor = new vec4(0.9, 0.9, 0.9, 1);
    let skirtColor = new vec4(0.6, 0.6, 0.6, 1);
    let bumperColor = new vec4(.7,.7,.7,1);
    let topPaintColor = new vec4(0.95,0.95,0.95, 1);
    let bedLiningColor = new vec4(0.4, 0.4, 0.4, 1);
    let windowColor = new vec4(0,0,0,1);
    let bottomColor = new vec4(.29, .25, .16, 1);
    let tailLightColor = new vec4(1, 0, 0, 1);
    let headLightColor = new vec4(.75, .75, 0, 1);
    let grillColor = new vec4(.45, .45, .45, 1);

    let offset:number = 0;
    let diff:number = 29; //if you change this by one it will look like it has crashed

    //Side Color
    gg.addTriangle(6 + offset,7 + offset,15 + offset, sidePaintColor);
    gg.addTriangle(8 + offset, 9 + offset, 10 + offset, sidePaintColor);
    gg.addQuad(1 + offset, 0 + offset, 3 + offset, 2 + offset, sidePaintColor);
    gg.addQuad(0 + offset, 3 + offset, 4 + offset, 15 + offset, sidePaintColor);
    gg.addQuad(15 + offset, 4 + offset, 5 + offset, 6 + offset, sidePaintColor);
    gg.addQuad(14 + offset, 15 + offset, 24 + offset, 25 + offset, sidePaintColor);
    gg.addQuad(14 + offset, 25 + offset, 26 + offset, 13 + offset, sidePaintColor);
    gg.addQuad(13 + offset, 26 + offset, 23 + offset, 12 + offset, sidePaintColor);
    gg.addQuad(12 + offset, 8 + offset, 10 + offset, 11 + offset, sidePaintColor);
    gg.addQuad(12 + offset, 15 + offset, 7 + offset, 8 + offset, sidePaintColor);
    //Skirt Color
    gg.addQuad(5 + offset, 16 + offset, 17 + offset, 6 + offset, skirtColor);
    gg.addQuad(1 + offset, 19 + offset, 18 + offset, 2 + offset, skirtColor);
    gg.addQuad(9 + offset, 20 + offset, 21 + offset, 22 + offset, skirtColor);
    //Window
    gg.addQuad(25 + offset, 24 + offset, 23 + offset, 26 + offset, windowColor);
    //Cabin struts
    gg.addQuad(14 + offset, 15 + offset, 15 + offset + diff, 14 + offset + diff, sidePaintColor);
    gg.addQuad(12 + offset, 13 + offset, 13 + offset + diff, 12 + offset + diff, sidePaintColor);
    //Bed side tops
    gg.addQuad(0 + offset, 15 + offset, 15 + offset + diff, 0 + offset + diff, bedLiningColor);
    //Tail light
    gg.addQuad(0 + offset, 28 + offset, 28 + offset + diff, 0 + offset + diff, tailLightColor);
    //Inner bedsides
    gg.addQuad(15 + offset + diff, 0 + offset + diff, 28 + offset + diff, 27 + offset + diff, sidePaintColor);
    //headlight
    gg.addQuad(11 + offset, 10 + offset, 10 + offset + diff, 11 + offset + diff, headLightColor);

    //Other Side
    //Side Color
    offset = diff * 2;
    gg.addTriangle(6 + offset,7 + offset,15 + offset, sidePaintColor);
    gg.addTriangle(8 + offset, 9 + offset, 10 + offset, sidePaintColor);
    gg.addQuad(1 + offset, 0 + offset, 3 + offset, 2 + offset, sidePaintColor);
    gg.addQuad(0 + offset, 3 + offset, 4 + offset, 15 + offset, sidePaintColor);
    gg.addQuad(15 + offset, 4 + offset, 5 + offset, 6 + offset, sidePaintColor);
    gg.addQuad(14 + offset, 15 + offset, 24 + offset, 25 + offset, sidePaintColor);
    gg.addQuad(14 + offset, 25 + offset, 26 + offset, 13 + offset, sidePaintColor);
    gg.addQuad(13 + offset, 26 + offset, 23 + offset, 12 + offset, sidePaintColor);
    gg.addQuad(12 + offset, 8 + offset, 10 + offset, 11 + offset, sidePaintColor);
    gg.addQuad(12 + offset, 15 + offset, 7 + offset, 8 + offset, sidePaintColor);
    //Skirt Color
    gg.addQuad(5 + offset, 16 + offset, 17 + offset, 6 + offset, skirtColor);
    gg.addQuad(1 + offset, 19 + offset, 18 + offset, 2 + offset, skirtColor);
    gg.addQuad(9 + offset, 20 + offset, 21 + offset, 22 + offset, skirtColor);
    //Window
    gg.addQuad(25 + offset, 24 + offset, 23 + offset, 26 + offset, windowColor);
    //Cabin struts
    gg.addQuad(14 + offset, 15 + offset, 15 + offset + diff, 14 + offset + diff, sidePaintColor);
    gg.addQuad(12 + offset, 13 + offset, 13 + offset + diff, 12 + offset + diff, sidePaintColor);
    //Bed side tops
    gg.addQuad(0 + offset, 15 + offset, 15 + offset + diff, 0 + offset + diff, bedLiningColor);
    //Tail light
    gg.addQuad(0 + offset, 28 + offset, 28 + offset + diff, 0 + offset + diff, tailLightColor);
    //Inner bedsides
    gg.addQuad(15 + offset + diff, 0 + offset + diff, 28 + offset + diff, 27 + offset + diff, sidePaintColor);
    //headlight
    gg.addQuad(11 + offset, 10 + offset, 10 + offset + diff, 11 + offset + diff, headLightColor);




    //Span truck points
    offset = diff*2;
    gg.addQuad(13, 14, 14 + offset, 13 + offset, topPaintColor);
    gg.addQuad(11, 12, 12 + offset, 11 + offset, topPaintColor);

    gg.addQuad(22, 10, 10 + offset, 22 + offset, skirtColor);//up facing bumper
    gg.addQuad(22, 21, 21 + offset, 22 + offset, bumperColor);//out facing bumper
    gg.addQuad(1, 19, 19 + offset, 1 + offset, bumperColor);//rear outfacing bumper

    gg.addQuad(8, 9, 9 + offset, 8 + offset, bottomColor);
    gg.addQuad(20, 9, 9 + offset, 20 + offset, bottomColor);
    gg.addQuad(7, 6, 6 + offset, 7 + offset, bottomColor);
    gg.addQuad(17, 6, 6 + offset, 17 + offset, bottomColor);
    gg.addQuad(5, 4, 4 + offset, 5 + offset, bottomColor);
    gg.addQuad(5, 16, 16 + offset, 5 + offset, bottomColor);
    gg.addQuad(3, 2, 2 + offset, 3 + offset, bottomColor);
    gg.addQuad(2, 18, 18 + offset, 2 + offset, bottomColor);
    gg.addQuad(15, 27, 27 + offset, 15 + offset, sidePaintColor);
    gg.addQuad(27, 28, 28 + offset, 27 + offset, bedLiningColor);
    gg.addQuad(1, 28, 28 + offset, 1 + offset, topPaintColor);

    //Span inner truck points
    offset = diff*3;
    gg.addQuad(11 + diff, 10 + diff, 10 + offset, 11 + offset, grillColor);//Grill
    gg.addQuad(14 + diff, 15 + diff, 15 + offset, 14 + offset, windowColor);
    gg.addQuad(12 + diff, 13 + diff, 13 + offset, 12 + offset, windowColor);


    return gg.getTrianglePoints();
}
