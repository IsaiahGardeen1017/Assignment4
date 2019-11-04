"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2, scalem, toradians} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {truckObject} from "./truckObject";
import {grassObject} from "./grassObject";

export class camera{
    truck:truckObject;
    camDirection:vec4;
    camLocation:vec4;
    fov:number;
    zoomSpeed:number = 1;
    dollySpeed:number = .5;
    fixed:boolean = false;
    camType:string;
    lastValidDirection:vec4 = new vec4(1, 0, 1, 0).normalize();

    constructor(){
        this.camType = "free";
        this.camDirection = new vec4(0,0,0,1);
        this.camLocation = new vec4(2.5, 2.5, 0, 1);
        this.fov = 60;
    }

    look():mat4{
        return lookAt(this.camLocation, this.camDirection, new vec4(0,1,0,0));
    }

    toFreeCam(){
        if(this.camType != "free") {
            this.camType = "free";
            this.fixed = false;
            this.camLocation[1] = 2.5;
            this.fov = 60;
        }
    }

    toChaseCam(){
        if(this.camType != "chase") {
            this.fov = 60;
            this.camType = "chase";
        }
    }

    toViewpointCam(){
        if(this.camType != "viewpoint") {
            this.fov = 60;
            this.camType = "viewpoint";
        }
    }

    zoomIn(){
        if(this.camType == "free") {
            this.fov -= this.zoomSpeed;
        }
    }

    zoomOut(){
        if(this.camType == "free") {
            this.fov += this.zoomSpeed;
        }
    }

    dollyIn(){
        if(this.camType == "free") {
            //dir is the direction the camera is pointing, we move along this vector to dolly in and out
            let dir: vec4 = this.camDirection.subtract(this.camLocation).normalize();//Find direction camera is pointing
            this.camLocation = this.camLocation.add(dir.scale(this.dollySpeed));//Moves in that direction
        }
    }

    dollyOut(){
        if(this.camType == "free") {
            //dir is the direction the camera is pointing, we move along this vector to dolly in and out
            let dir: vec4 = this.camDirection.subtract(this.camLocation).normalize();//Find direction camera is pointing
            this.camLocation = this.camLocation.add(dir.scale(-this.dollySpeed));//Moves in that direction
        }
    }

    //Switch from pointing at origin and pointing at the vehicle and back
    toggleFreeCam(){
        if(this.camType == "free") {
            if (!this.fixed) {
                this.camDirection = new vec4(0, 0, 0, 1);
                this.fixed = true;
            } else {
                this.fixed = false;
            }
        }
    }




    update(){

        let direction:vec4;
        let offset:number;
        let dir:vec4;
        let camDir:vec4
        switch(this.camType) {
            case"free":
                if(!this.fixed){
                    //Camera is pointed towards the truck always. xoffset and yoffset denote the trucks position
                    this.camDirection = new vec4(this.truck.xoffset, 0, this.truck.zoffset, 1);
                }
                break;
            case"chase":
                this.camDirection = new vec4(this.truck.xoffset, 0, this.truck.zoffset, 1);
                //let direction:vec4 = this.truck.realVelocity.normalize();
                direction = new vec4(1, 0, 0, 0).normalize();
                offset = 90 + (this.truck.steeringWheel * 2);

                //Diretion the truck is traveling, we use this to find the position of the camera.
                //Formula is x2=cosβx1−sinβy1  y2=sinβx1+cosβy1 to rotate a vector
                dir = new vec4((Math.sin(toradians(this.truck.yrot + offset)) * direction[0]) + (Math.cos(toradians(this.truck.yrot + offset)) * direction[2]),0,(Math.cos(toradians(this.truck.yrot + offset)) * direction[0]) - (Math.sin(toradians(this.truck.yrot + offset)) * direction[2]), 0).normalize();

                //Cam is pointed towards slightly above the position of the truck
                this.camLocation = new vec4(this.truck.xoffset - (2 * dir[0]), 0.5, this.truck.zoffset -  (2 * dir[2]), 1);
                break;
            case"viewpoint":
                //this vector gets multiplied to create a directional vector
                direction = new vec4(1, 0, 0, 0).normalize();
                offset = 90;

                //Dirrection the truck is travling
                //Formula is x2=cosβx1−sinβy1  y2=sinβx1+cosβy1 to rotate a vector
                dir = dir = new vec4((Math.sin(toradians(this.truck.yrot + offset)) * direction[0]) + (Math.cos(toradians(this.truck.yrot + offset)) * direction[2]),0,(Math.cos(toradians(this.truck.yrot + offset)) * direction[0]) - (Math.sin(toradians(this.truck.yrot + offset)) * direction[2]), 0).normalize();

                //Direction the camera points
                offset += this.truck.head.yRotOffset;
                //Formula is x2=cosβx1−sinβy1  y2=sinβx1+cosβy1 to rotate a vector
                camDir = new vec4((Math.sin(toradians(this.truck.yrot + offset)) * direction[0]) + (Math.cos(toradians(this.truck.yrot + offset)) * direction[2]),0,(Math.cos(toradians(this.truck.yrot + offset)) * direction[0]) - (Math.sin(toradians(this.truck.yrot + offset)) * direction[2]), 0).normalize();

                //How far forward from the origin of the truck that the camera is, arbitrariy set so that it matches the head
                let camoffset:number = 0;

                //Puts the camera where the truck is and moves it forward a bit towards the front of the truck
                //y is 1.55 becasue that happens to be the height of the center of the rendered head
                this.camLocation = new vec4(this.truck.xoffset + (dir[0] * camoffset), 0, this.truck.zoffset + (dir[2] * camoffset), 1);

                //+ (dir[0] * camoffset) is used so that the directions always point away from the camera instead of the truck origin
                //+ (camDir[0] * 2) sets the point wherer the camera is pointed, y is 1.55 because that is the hieght of the camera
                this.camDirection = new vec4(this.truck.xoffset + (camDir[0] * 2) + (dir[0] * camoffset), 0.155, this.truck.zoffset + (camDir[2] * 2) + (dir[0] * camoffset), 1);
                break;
        }
    }
}