import {initShaders, vec4, mat4, flatten, perspective, lookAt, rotateX, rotateY, loadFileAJAX} from "./helperfunctions.js";
import {geometryGenerator} from "./geometeryGenerator.js";
"use strict"
export function getPly(gl:WebGLRenderingContext, bufferID:WebGLBuffer, loadingOutput:HTMLElement){
                let s:string = loadFileAJAX("FinalF1.txt");
                let numbers:string[] = s.split(/\s+/); //split on white space
                let gg:geometryGenerator = new geometryGenerator();
                let numVerts:number = parseFloat(numbers[0]);
                let numTris:number = parseFloat(numbers[1]);
                for(let i:number = 2; i < (numVerts * 6) + 2; i += 6) {
                    gg.addVertex(parseFloat(numbers[i]), parseFloat(numbers[i + 1]), parseFloat(numbers[i + 2]), new vec4(parseFloat(numbers[i + 3]), parseFloat(numbers[i + 4]), parseFloat(numbers[i + 5]), 0));//Adds each vertex and normal
                }
                for(let i:number = (6 * numVerts) + 2; i < numbers.length - 1; i += 4){
                    gg.addTriangle(parseInt(numbers[i + 1]), parseInt(numbers[i + 2]), parseInt(numbers[i + 3]));//Adds each triangle
                }
                let trianglePoints:vec4[] = gg.getTrianglePoints();
                gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
                gl.bufferData(gl.ARRAY_BUFFER, flatten(trianglePoints), gl.STATIC_DRAW);
                loadingOutput.innerText = "Finished Loading";
}


export function getPlyPoints(fileName:string):vec4[]{
    let s:string = loadFileAJAX("fileName");
    let numbers:string[] = s.split(/\s+/); //split on white space
    let gg:geometryGenerator = new geometryGenerator();
    let numVerts:number = parseFloat(numbers[0]);
    //let numTris:number = parseFloat(numbers[1]);
    for(let i:number = 2; i < (numVerts * 6) + 2; i += 6) {
        gg.addVertex(parseFloat(numbers[i]), parseFloat(numbers[i + 1]), parseFloat(numbers[i + 2]), new vec4(parseFloat(numbers[i + 3]), parseFloat(numbers[i + 4]), parseFloat(numbers[i + 5]), 0));//Adds each vertex and normal
    }
    for(let i:number = (6 * numVerts) + 2; i < numbers.length - 1; i += 4){
        gg.addTriangle(parseInt(numbers[i + 1]), parseInt(numbers[i + 2]), parseInt(numbers[i + 3]));//Adds each triangle
    }
    return gg.getTrianglePoints();
}