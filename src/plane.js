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
        this.mesh
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
        for (let face of faceIndicies) {
            this.triangles.push(new Triangle(this.vertices[face[0]], this.vertices[face[1]], this.vertices[face[2]]))
        }
        console.log(this)
        this.mesh = new Mesh(this.triangles)
    }
    paths() {
        ///
        // turn verts into lines 
        // for row across. we need to divide by width diVX? 
        // return new Paths([new Path(this.vertices)])
        let lineLength = this.divY + 1
        let paths = []
        let lastLine
        for (let i = 0; i <= this.vertices.length; i += lineLength) {
            let line = this.vertices.slice(i, i + lineLength)
            if (i == 0 || i == this.vertices.length) {
                paths.push(new Path(line))

            }
            else {
                lastLine = this.vertices.slice(i - lineLength, (i - lineLength) + lineLength)

                let numLines = 3

                for (let j = 0; j <= numLines; j++) {
                    let interpLine = []
                    let lerpFactor = j / numLines
                    for (let vert of line) {
                        let index = line.indexOf(vert)

                        let newVert = vert.lerp(lastLine[index], lerpFactor)
                        if (index > 1) {
                        }
                        newVert = newVert.add(new Vector(0, 0,.29))
                        interpLine.push(newVert)
                    }
                    paths.push(new Path(interpLine))
                }

            }
        }

        return new Paths(paths)

        // return new Paths(paths.concat(...this.mesh.paths().paths))
    }
    intersect(ray) {
        return this.mesh.intersect(ray)
    }
}
