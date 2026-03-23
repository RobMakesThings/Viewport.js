
// import { Triangle } from "./triangle"
import { boxForTriangles } from "./box.js"
import { Tree } from "./bvhTree.js"
import { Plane } from "./plane.js"
import { Vector } from "./vector.js"
import { Cube } from "./cube.js"
import { Box } from "./box.js"
import { Matrix, Translate } from "./matrix.js"
import { loadOBJ } from "./obj.js"
import { loadBinaryStl, loadTextSTL } from "./stl.js"
import { Path, Paths } from './path.js'
import { Triangle } from "./triangle.js"

/**
     * 
     * build your own Triangles to place inside, or use a model loader function
     * @see {@link loadOBJ} {@link loadBinaryStl},or {@link loadTextSTL} to load a model or build your own triangles from scratch
     * @param {Triangle} triangles 
     * 
     * 
     */
export class Mesh {

    constructor(triangles) {

        this.box = boxForTriangles(triangles)
        this.triangles = triangles
        this.tree = null
        this.color = "#000000"

        this.compile()

    }
    compile() {
        if (this.tree == null) {
            let shapes = []
            for (let triangle of this.triangles) {
                shapes.push(triangle)
            }
            this.tree = new Tree(shapes)
        }
    }
    boundingBox() {
        return this.box
    }
    contains() {
        return false
    }
    intersect(ray) {
        // console.log(this, ray)
        if (this.tree == null) {
            this.compile()
        }
        return this.tree.intersect(ray)
    }

    paths() {
        let result = []
        for (let tri of this.triangles) {
            result.push(tri.paths())
        }
        return new Paths(result)
    }
    updateBoundingBox() {
        this.box = boxForTriangles(this.triangles)
    }
    /**
     * Fits mesh inside of cube of size 1
     */
    unitCube() {

        this.fitInside(new Box(new Vector(0, 0, 0), new Vector(1, 1, 1)), new Vector(0, 0, 0))
        this.moveTo(new Vector(0, 0, 0), new Vector(.5, .5, .5))
    }
    /**
     * 
     * @param {Vector} position 
     * @param {Vector} anchor 
     */
    moveTo(position, anchor) {
        let matrix = Translate(position.sub(this.box.anchor(anchor)))
        this.transform(matrix)

    }/**
     * fits inside of given box
     * @param {Box} box 
     * @param {Vector} anchor 
     */
    fitInside(box, anchor) {
        let scale = box.size().div(this.boundingBox().size()).minComponent()

        let extra = box.size().sub(this.boundingBox().size().mulScalar(scale))
        let matrix = new Matrix()

        matrix = matrix.translate(this.boundingBox().min.mulScalar(-1))

        matrix = matrix.scale(new Vector(scale, scale, scale))

        matrix = matrix.translate(box.min.add(extra.mult(anchor)))

        this.transform(matrix)

    }
    /**
     * transforms mesh by given matrix
     * @param {Matrix} matrix 
     */
    transform(matrix) {
        for (let tri of this.triangles) {
            tri.v1 = matrix.mulPosition(tri.v1)
            tri.v2 = matrix.mulPosition(tri.v2)
            tri.v3 = matrix.mulPosition(tri.v3)
            tri.updateBoundingBox()
        }
        this.updateBoundingBox()
        this.tree = null// dirty according to orignal comment
    }

    saveBinarySTL(path) {
        return saveBinaryStl(this)
    }
    /**
     * 
     * @param {Number} size Size of cube example 1/36
     * @returns {Array[Cube]} Array of cubes to be added to scene
     */
    voxelize(size) {
        let m = this
        let z1 = m.box.min.z
        let z2 = m.box.max.z
        let set = new Map()
        for (let z = z1; z <= z2; z += size) {
            let plane = new Plane(new Vector(0, 0, z), new Vector(0, 0, 1))
            let paths = plane.intersectMesh(m)
            for (let path of paths.paths) {
                for (let v of path.verts) {
                    let x = Math.floor(v.x / size + .5) * size
                    let y = Math.floor(v.y / size + 0.5) * size
                    let z = Math.floor(v.z / size + .05) * size
                    set.set(new Vector(x, y, z), true)

                }
            }
        }
        let result = []

        for (let v of set) {
            v = v[0]
            let cube = new Cube(v.subScalar(size / 2), v.addScalar(size / 2))
            result.push(cube)
        }
        return result
    }
}


// terrain plane----
// build square mesh , or x-y rect
// then adjust height of each point by height fucntion