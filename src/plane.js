import { EPS } from "./common.js"
import { Vector } from "./vector.js"
import { Path, Paths } from "./path.js"
import { Triangle } from "./triangle.js"
import { Mesh } from "./mesh.js"
import { boxForTriangles } from "./box.js"
import { remap, lerp } from "./util.js"

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

    constructor(point, normal, size, divX, divY, heightFunction) {

        super(point, normal)
        this.center = point
        this.size = size
        this.divX = divX
        this.divY = divY
        this.heightFunction = heightFunction// as arrow function 
        this.vertices = []
        this.triangles = []
        this.linesPerQuad = 2
        this.faceIndicies
        this.mesh
        this.color = "#000000"
        this.genMesh()
        this.box = boxForTriangles(this.triangles)
    }
    compile() { }
    boundingBox() {
        return this.box
    }
    // }
    genMesh() {
        // Generate vertices
        let stepX = this.size / this.divX
        let stepY = this.size / this.divY
        for (let i = 0; i <= this.divX; i++) {
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

        let faceIndicies = []
        const cols = this.divX + 1;
        for (let i = 0; i < this.divX; i++) {
            for (let j = 0; j < this.divY; j++) {
                const topLeft = i * cols + j;
                const topRight = topLeft + 1;
                const bottomLeft = (i + 1) * cols + j;
                const bottomRight = bottomLeft + 1;
                faceIndicies.push([topLeft, bottomLeft, bottomRight]);
                faceIndicies.push([topLeft, bottomRight, topRight]);



            }
        }
        this.faceIndicies = faceIndicies
        for (let face of faceIndicies) {
            this.triangles.push(new Triangle(this.vertices[face[0]], this.vertices[face[1]], this.vertices[face[2]]))
        }
        // console.log(this)
        this.mesh = new Mesh(this.triangles)
    }

    paths() {
        let lineLength = this.divX * 2 + 2
        let result = []
        for (let [i, tri] of this.triangles.entries()) {
            /// line from midpoint of one line to another

            let triNum = i % (lineLength)
            let paths = []

            let p1
            let p2

            if (triNum % 2 == 0) {// we are in the "right side" of a quad
                for (let j = 0; j < this.linesPerQuad; j++) {
                    let lerpFactor = j / this.linesPerQuad

                    p1 = tri.v1.lerp(tri.v2, lerpFactor)
                    p2 = tri.v1.lerp(tri.v3, lerpFactor)
                    paths.push(new Path([p1, p2]))


                }



            }
            else {//we are in the left side of a quad, from top left(v1) to bottom left(v2), then top left(v1) to bottom right(v3)
                for (let j = 0; j < this.linesPerQuad; j++) {
                    let lerpFactor = j / this.linesPerQuad
                    p1 = tri.v1.lerp(tri.v2, lerpFactor)
                    p2 = tri.v3.lerp(tri.v2, lerpFactor)
                    paths.push(new Path([p1, p2]))


                }


            }
            // reconnect all the paths.// easy to do in vpype but better to do it now. not really a fun problem to solve

            result.push(...paths)
        }
        let final = []
        for (let i = 0; i < this.linesPerQuad; i++) { final.push([]) }
        let currentOffset = 0// offset by lineLength each time we get there
        for (let [i, path] of result.entries()) {
            let vertsPerQuad = this.linesPerQuad*this.divX*2 // when we need to add new arrays to final because we are done drawing the first set of lines
            let lineNum = i % this.linesPerQuad

            final[lineNum + currentOffset].push(...path.verts)
            if ((i %vertsPerQuad) == vertsPerQuad-1 ) {// we have made like 3 long lines, time to push them as lines? make new stuff and move offsset
                currentOffset += this.linesPerQuad
                for(let j = 0; j<this.linesPerQuad;j++){
                    final.push([])
                }

                
            }




        }
        /// shit, one more loop needed. ugh. make a da paths a
        result=[]
        for (let path of final) {
            result.push(new Path(path,this.color))

        }
        // console.log(result)
        return new Paths(result)
        // return new Paths(result.concat(...this.mesh.paths().paths))

    }
    intersect(ray) {
        return this.mesh.intersect(ray)
    }
}


function easeOutQuart(t) {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
}