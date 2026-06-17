import { EPS } from "./common.js"
import { Vector } from "./vector.js"
import { Path, Paths } from "./path.js"
import { Triangle } from "./triangle.js"
import { Mesh } from "./mesh.js"
import { boxForTriangles } from "./box.js"
import { remap, lerp, constrain } from "./util.js"
import *as ease from "../examples/assets/easing.js"
import { Worley, Perlin, Fractal } from "../examples/assets/noise.js";

export class Plane {
    constructor(point, normal) {
        this.point = point
        this.normal = normal
    }
    intersectSegment(v0, v1) {
        let u = v1.sub(v0)
        let w = v0.sub(this.point)
        let d = this.normal.dot(u)
        let n = -this.normal.dot(w)
        if (d > -EPS && d < EPS) {
            return [new Vector(), false]
        }
        let t = n / d
        if (t < 0 || t > 1) {
            return [new Vector(), false]

        }
        let v = v0.add(u.mulScalar(t))
        return [v, true]

    }
    intersectTriangle(t) {
        let [v1, ok1] = this.intersectSegment(t.v1, t.v2)
        let [v2, ok2] = this.intersectSegment(t.v2, t.v3)
        let [v3, ok3] = this.intersectSegment(t.v3, t.v1)
        if (ok1 && ok2) {
            return [v1, v2, true]
        }
        if (ok1 && ok3) {
            return [v1, v3, true]
        }
        if (ok2 && ok3) {
            return [v2, v3, true]
        }
        return [v3, v3, false]

    }
    intersectMesh(mesh) {
        let result = []//paths
        for (let tri of mesh.triangles) {
            let [v1, v2, ok] = this.intersectTriangle(tri)
            if (ok) {
                result.push(new Path([v1, v2]))
            }
        }
        // console.log(result);

        return new Paths(result)
    }
}

/**
 * This probably isnt ready for prime time. 
 * should change so it draws out from center, pretty sure divs and size can affect posiition in a way
 * 
 */
export class TerrainPlane extends Plane {
    /**
     * 
     * @param {Vector} point center of plane
     * @param {Vector} normal where the top of the plane points 
     * @param {Number} sizeX 
     * @param {Number} sizeY 
     * @param {Number} divX how many tris on the x axis
     * @param {Number} divY how many tris on the y axis
     * @param {Function} heightFunction 
     */
    constructor(point, normal, sizeX, sizeY, divX, divY, heightFunction) {

        super(point, normal)
        this.center = point
        this.sizeX = sizeX
        this.sizeY = sizeY

        this.divX = divX
        this.divY = divY
        this.heightFunction = heightFunction// as arrow function 
        this.vertices = []
        this.triangles = []
        this.linesPerQuad = 2
        this.faceIndicies
        this.mesh
        this.eye = null
        this.color = "#000000"
        this.genMesh()
        this.box = boxForTriangles(this.triangles)
    }
    compile() { }
    setColor(color) {
        this.color = color
        this.genMesh()

    }
    boundingBox() {
        return this.box
    }
    genMesh() {
        // Generate vertices
        this.vertices = []
        this.triangles = []
        this.mesh = []
        let stepX = this.sizeX / this.divX
        let stepY = this.sizeY / this.divY
        for (let i = 0; i <= this.divX; i++) {/// create a grid of vertex
            for (let j = 0; j <= this.divY; j++) {
                const x = -this.divX / 2 + i * stepX;
                const y = -this.divY / 2 + j * stepY;
                const z = this.heightFunction ? this.heightFunction(x, y) : 0;

                this.vertices.push(new Vector(
                    this.center.x + x,
                    this.center.y + y,
                    this.center.z + z
                ));
            }
        }


        ///
        let faceIndicies = []
        // const cols = this.divX - 1;
        const rows = this.divY + 1;
        for (let i = 0; i < this.divX; i++) {// we dont visit the bottom or "rightmost" vertexes becasue they are part of tris created below
            for (let j = 0; j < this.divY; j++) {
                let topLeft = ((i * rows) + j)
                let topRight = topLeft + rows
                let bottomLeft = topLeft + 1
                let bottomRight = topRight + 1
                faceIndicies.push([topLeft, bottomLeft, bottomRight]);
                faceIndicies.push([topLeft, bottomRight, topRight]);


            }
        }


        this.faceIndicies = faceIndicies

        for (let face of faceIndicies) {
            this.triangles.push(new Triangle(this.vertices[face[0]], this.vertices[face[1]], this.vertices[face[2]], this.color))
        }
        this.mesh = new Mesh(this.triangles, this.color)

    }

    paths() {

        //    return this.mesh.paths(this.eye)
        //    return this.mesh.lineFill(this.eye)
        let horizontal, vertical, horizontalResult, verticalResult, horizontalColor, verticalColor
        horizontal = true
        vertical = true
        let colors = [ "#ffa600","#55d400","#ffa600","#55d400","#ff006a"]

        verticalColor = "#00e0fd"
        horizontalColor = "#ffae00"
        let horizontalDensity =1
        let verticalDensity = 1



        // console.log(this.triangles)
        let lineLength = this.divX * 2 + 2
        if (horizontal) {
            let result = []
            for (let [i, tri] of this.triangles.entries()) {
                let triNum = i % (lineLength)
                let paths = []
                let p1
                let p2

                // horizontalColor = getRandomElementFromArrayNoise(colors,tri.v1.z)
                if (triNum % 2 == 0) {// we are in the "right side" of a quad
                    for (let j = 0; j < ( this.linesPerQuad*horizontalDensity); j++) {
                        let lerpFactor = j /( this.linesPerQuad*horizontalDensity)
                        lerpFactor = ease.easeInOutSine(lerpFactor)
                        
                        p1 = tri.v1.lerp(tri.v2, lerpFactor)
                        p2 = tri.v1.lerp(tri.v3, lerpFactor)
                        paths.push(new Path([p1, p2], horizontalColor ? horizontalColor : this.color))
                    }

                }
                else {//we are in the left side of a quad, from top left(v1) to bottom left(v2), then top left(v1) to bottom right(v3)
                    for (let j = 0; j < ( this.linesPerQuad*horizontalDensity); j++) {
                        let lerpFactor = j /( this.linesPerQuad*horizontalDensity)
                        lerpFactor = ease.easeInOutSine(lerpFactor)
                        p1 = tri.v1.lerp(tri.v2, lerpFactor)
                        p2 = tri.v3.lerp(tri.v2, lerpFactor)
                        paths.push(new Path([p1, p2], horizontalColor ? horizontalColor : this.color))

                    }

                }
                result.push(...paths)

            }
            let reconnect = false
            if (reconnect) {
                let final = []
                for (let i = 0; i < this.linesPerQuad * this.divY; i++) { final.push([]) }
                let currentOffset = 0// offset by lineLength each time we get there
                let count = 0
                for (let [i, path] of result.entries()) {

                    let colOffset = Math.floor(i % (this.linesPerQuad * 2)) % this.divY
                    let linesPerColumn = this.linesPerQuad * 2 * this.divY
                    let linePerSquare = this.linesPerQuad * 2
                    let lineIndex = (i % (this.linesPerQuad * 2)) % this.linesPerQuad
                    if (i % linePerSquare == 0) {
                        currentOffset += this.linesPerQuad
                    }
                    if (i % linesPerColumn == 0) {
                        currentOffset = 0
                    }
                    final[lineIndex + currentOffset].push(...path.verts)
                }

                /// shit, one more loop needed. ugh. make a da paths a
                result = []
                for (let path of final) {
                    // horizontalColor = getRandomElementFromArrayNoise(colors)

                    result.push(new Path(path, horizontalColor ? horizontalColor : this.color))

                }

            }
                horizontalResult = result

            
        }

        if (vertical) {
            let result = []
            for (let [i, tri] of this.triangles.entries()) {
                // verticalColor = getRandomElementFromArrayNoise(colors,-tri.v1.z)
                let paths = []
                if (i % 2 == 0) {

                    for (let j = 0; j <(this.linesPerQuad*verticalDensity); j++) {
                        let lerpFactor = j / (this.linesPerQuad*verticalDensity)
                        //lerpFactor = ease.easeInOutSine(lerpFactor)
                        let p1 = tri.v2.lerp(tri.v3, lerpFactor)
                        let p2 = tri.v1.lerp(tri.v3, lerpFactor)
                        paths.push(new Path([p1, p2], verticalColor ? verticalColor : this.color))


                    }
                }
                else {
                    for (let j = 0; j < (this.linesPerQuad*verticalDensity); j++) {
                        let lerpFactor = j / (this.linesPerQuad*verticalDensity)
                        //lerpFactor = ease.easeInOutSine(lerpFactor)
                        let p1 = tri.v1.lerp(tri.v2, lerpFactor)
                        let p2 = tri.v1.lerp(tri.v3, lerpFactor)
                        paths.push(new Path([p1, p2], verticalColor ? verticalColor : this.color))


                    }

                }
                result.push(...paths)
            }
       let reconnect = false
       if(reconnect){
             let final = []
            let currentOffset = 0
            for (let j = 0; j < this.linesPerQuad; j++) {
                final.push([])
            }
            for (let [i, path] of result.entries()) {
                let lineIndex = i % (this.linesPerQuad * 2) % this.linesPerQuad
                let linesPerColumn = this.linesPerQuad * 2 * this.divY
                if (i % (linesPerColumn) == 0 && i != 0) {
                    currentOffset += this.linesPerQuad
                    for (let j = 0; j < this.linesPerQuad; j++) {
                        final.push([])
                    }
                }
                final[lineIndex + currentOffset].push(...path.verts)

            }
            for (let path of final) {// ^^^ if you did up there properly i dont think youd have to do this. not elegant. 
                path.sort((a, b) => a.y - b.y)

            }

            result = []
            for (let path of final) {
                // verticalColor = getRandomElementFromArrayNoise(colors)

                result.push(new Path(path, verticalColor ? verticalColor : this.color))

            }
       }

            verticalResult = result
        }

        if (horizontal && vertical) {
            // return new Paths(this.mesh.paths().paths.concat(...verticalResult).concat(...horizontalResult))
            return new Paths(verticalResult.concat(...horizontalResult))
            return new Paths(horizontalResult.concat(...verticalResult))



        }
        if (horizontal) {
            return new Paths(horizontalResult)

        }
        if (vertical) {
            return new Paths(verticalResult)

        }
        // return new Paths(result.concat(...this.mesh.paths().paths))

        console.error("you didnt choose whether to draw horizontal or vertical lines")
        // return new Paths(result.concat(...this.mesh.lineFill().paths))

    }
    horizontalLines() {
        return this.mesh.paths(this.eye)
        let lineLength = this.divX * 2 + 2
        let result = []
        console.log(this)
        for (let [i, tri] of this.triangles.entries()) {
            /// line from midpoint of one line to another

            let triNum = i % (lineLength)
            let paths = []

            let p1
            let p2

            if (triNum % 2 == 0) {// we are in the "right side" of a quad
                for (let j = 0; j < this.linesPerQuad; j++) {
                    let lerpFactor = j / this.linesPerQuad
                        //lerpFactor = ease.easeInOutSine(lerpFactor)

                    p1 = tri.v1.lerp(tri.v2, lerpFactor)
                    p2 = tri.v1.lerp(tri.v3, lerpFactor)
                    paths.push(new Path([p1, p2]))


                }



            }
            else {//we are in the left side of a quad, from top left(v1) to bottom left(v2), then top left(v1) to bottom right(v3)
                for (let j = 0; j < this.linesPerQuad; j++) {
                    let lerpFactor = j / this.linesPerQuad
                        //lerpFactor = ease.easeInOutSine(lerpFactor)
                    p1 = tri.v1.lerp(tri.v2, lerpFactor)
                    p2 = tri.v3.lerp(tri.v2, lerpFactor)
                    paths.push(new Path([p1, p2]))


                }


            }
            // reconnect all the paths.// 

            result.push(...paths)
        }
        let final = []
        for (let i = 0; i < this.linesPerQuad; i++) { final.push([]) }
        let currentOffset = 0// offset by lineLength each time we get there
        for (let [i, path] of result.entries()) {
            let vertsPerQuad = this.linesPerQuad * this.divY * 2 // when we need to add new arrays to final because we are done drawing the first set of lines
            let lineNum = i % this.linesPerQuad

            final[lineNum + currentOffset].push(...path.verts)
            if ((i % vertsPerQuad) == vertsPerQuad - 1) {// we have made like 3 long lines, time to push them as lines? make new stuff and move offsset
                currentOffset += this.linesPerQuad
                for (let j = 0; j < this.linesPerQuad; j++) {
                    final.push([])
                }


            }




        }
        /// shit, one more loop needed. ugh. make a da paths a
        result = []
        for (let path of final) {
            result.push(new Path(path, this.color))

        }
        // console.log(result)
        return new Paths(result)
        return new Paths(result.concat(...this.mesh.lineFill().paths))

    }
    intersect(ray) {
        return this.mesh.intersect(ray)
    }
}


let noise =new Perlin(Date.now())
function getRandomElementFromArrayNoise(array,x) {
    if (!Array.isArray(array) || array.length === 0) {
        console.error('Invalid input: array must be a non-empty array');
        return null;
    }
    // x = x/10
    let n = remap(noise.noise(x,x,x),-.5,.5,.1,.9)
    n = constrain(n,0,.9)
    const noiseIndex = Math.floor(n*array.length)
    // console.log(x,array[noiseIndex],array,noiseIndex)
    console.log(n)
    // const randomIndex = Math.floor(Math.random() * array.length);
    return array[noiseIndex];
}
function getRandomElementFromArray(array) {
    if (!Array.isArray(array) || array.length === 0) {
        console.error('Invalid input: array must be a non-empty array');
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}