"use strict";

import{vec3, vec4} from "./helperfunctions.js";

export class geometryGenerator{
    vertices:vec4[];
    triangles:vec4[];

    constructor(){
        this.vertices = [];
        this.triangles = [];
    }

    addVertex(index:number, x:number, y:number, z:number){
        this.vertices[index] = new vec4(x, y, z, 1);
    }

    addTriangle(p1:number, p2:number, p3:number, color:vec4){
        //alert(this.vertices[p1] +"&"+ new vec4(color[0], color[1], color[2], color[3]) +"&"+ this.vertices[p2] +"&"+ new vec4(color[0], color[1], color[2], color[3]) +"&"+ this.vertices[p3] +"&"+ new vec4(color[0], color[1], color[2], color[3]));
        this.triangles.push(this.vertices[p1]);
        //alert(new vec4(color[0], color[1], color[2], color[3]));
        this.triangles.push(new vec4(color[0], color[1], color[2], color[3]));
        //alert(this.vertices[p2]);
        this.triangles.push(this.vertices[p2]);
        //alert(new vec4(color[0], color[1], color[2], color[3]));
        this.triangles.push(new vec4(color[0], color[1], color[2], color[3]));
        //alert(this.vertices[p3]);
        this.triangles.push(this.vertices[p3]);
        //alert(new vec4(color[0], color[1], color[2], color[3]));
        this.triangles.push(new vec4(color[0], color[1], color[2], color[3]));
    }

    getTrianglePoints():vec4[]{
        return this.triangles;
    }


}