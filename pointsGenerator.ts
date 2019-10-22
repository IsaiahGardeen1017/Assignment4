"use strict";

import{vec3, vec4,  vec2} from "./helperfunctions.js";

export class pointsGenerator{
    vertices:vec4[];
    triangles:vec4[];

    constructor(){
        this.vertices = [];
        this.triangles = [];
    }

    addVertex(x:number, y:number, z:number, vector:vec4){
        this.vertices.push(new vec4(x, y, z, 1));
        this.vertices.push(vector);
    }

    addTriangle(p1:number, p2:number, p3:number){
        this.triangles.push(this.vertices[p1 * 2]);
        this.triangles.push(this.vertices[(p1 * 2) + 1]);
        this.triangles.push(this.vertices[p2 * 2]);
        this.triangles.push(this.vertices[(p2 * 2) + 1]);
        this.triangles.push(this.vertices[p3 * 2]);
        this.triangles.push(this.vertices[(p3 * 2) + 1]);
    }

    getTrianglePoints():vec4[]{
        return this.triangles;
    }

    addQuad(p1:number, p2:number, p3:number, p4:number){
        this.addTriangle(p1, p2, p3);
        this.addTriangle(p1, p3, p4);
    }
}

