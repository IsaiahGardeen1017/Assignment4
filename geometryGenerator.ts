"use strict";

import{vec3, vec4,  vec2} from "./helperfunctions.js";

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

    addQuad(p1:number, p2:number, p3:number, p4:number, color:vec4){
        addTriangle()
    }
}


//Probalby won't use since coloring functionality is limited
export function expandGeometry(width:number, oldGG:geometryGenerator, color:vec4):vec4[]{
    let newGG = new geometryGenerator();

    let numPts:number = oldGG.vertices.length;

    for(let i:number = 0; i < numPts; i++){
        newGG.addVertex(i, oldGG.vertices[i][0], oldGG.vertices[i][1], (width/2) + oldGG.vertices[i][2]);
        newGG.addVertex(i + numPts, oldGG.vertices[i][0], oldGG.vertices[i][1], -(width/2 + + oldGG.vertices[i][2]));
    }
    //Copy over triangles
    for(let i:number = 0; i < oldGG.triangles.length; i++){
        if(i % 2 == 0){//Vertex
            newGG.triangles.push(new vec4(oldGG.triangles[i][0], oldGG.triangles[i][1], (width/2) + oldGG.triangles[i][2], 1))
        }else{//Color
            newGG.triangles.push(oldGG.triangles[i]);
        }
    }
    //Add other side from old copied side triangles
    for(let i:number = 0; i < oldGG.triangles.length; i++){
        if(i % 2 == 0){//Vertex
            newGG.triangles.push(new vec4(oldGG.triangles[i][0], oldGG.triangles[i][1], -(width/2 + oldGG.triangles[i][2]), 1))
        }else{//Color
            newGG.triangles.push(oldGG.triangles[i]);
        }
    }

    //Add triangles in between both sides
    for(let i:number = 0; i < oldGG.vertices.length; i++){
        let n:number = oldGG.vertices.length;
        newGG.addTriangle(i, (i+1)%n, i + n, new vec4(0.9,0.9,0.9,1));
        newGG.addTriangle((i+1)%n + n,(i+1)%n,i + n, color);
    }



    //alert(newGG.getTrianglePoints());
    return newGG.getTrianglePoints();
}