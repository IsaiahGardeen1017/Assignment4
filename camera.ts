"use strict";

import {flatten, lookAt, mat4, rotateY, rotateX, rotateZ, translate, vec4, vec2, scalem} from "./helperfunctions.js";
import {wheelObject} from "./wheelObject.js";
import {geometryGenerator, expandGeometry} from "./geometryGenerator.js";
import {truckObject} from "./truckObject";
import {grassObject} from "./grassObject";

export class camera{
    truck:truckObject;
    camDirection:vec4;
    camLocation:vec4;
    fov:number;
    zoomSpeed:number = 1;
    dollySpeed:number = .1;

    constructor(){
        this.camDirection = new vec4(0,0,0,1);
        this.camLocation = new vec4(2, 0.5, 2, 1);
        this.fov = 60;
    }

    look():mat4{
        return lookAt(this.camLocation, this.camDirection, new vec4(0,1,0,0));
    }

    zoomIn(){
        this.fov -= this.zoomSpeed;
    }

    zoomOut(){
        this.fov += this.zoomSpeed;
    }

    dollyIn(){
        let dir:vec4 = this.camDirection.subtract(this.camLocation).normalize();//Find direction camera is pointing
        this.camLocation = this.camLocation.add(dir.scale(this.dollySpeed));//Moves in that direction
    }

    dollyOut(){
        let dir:vec4 = this.camDirection.subtract(this.camLocation).normalize();//Find direction camera is pointing
        this.camLocation = this.camLocation.add(dir.scale(-this.dollySpeed));//Moves in that direction
    }

    update(){
        this.camDirection = new vec4(this.truck.xoffset, 0, this.truck.zoffset, 1);
        //let tDist:number = Math.sqrt((this.truck.xoffset * this.truck.xoffset) + (this.truck.zoffset * this.truck.zoffset));

    }
}