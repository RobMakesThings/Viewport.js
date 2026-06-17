
let PERPSPECTIVE

import { PI } from "./common.js"
import { Matrix, lookAt, Translate, } from "./matrix.js"
import { Vector } from "./vector.js"
import { Tree } from "./bvhTree.js"
import { Path, Paths } from './path.js'
import { Ray } from "./ray.js"
/**
 * A scene holds all the shapes, the BVH tree, and the render functions
 */
export class Scene {
    constructor() {
        this.shapes = []
        this.tree = null
        this.projection = "perspective"
        this.stats = {}
    }
    /**
     * 
     * @param {Bool} perspective if True Orthograpic. default perspective
     */
    ortho(perspective){
        if(perspective==true){
             this.projection= "orthographic"

        }
        else{
            this.projection="perspective"
        }
    }
    
    compile() {///create any BVH's neccesary
        let s = this

        s.tree = new Tree(this.shapes)

        if (!s.tree) {

            s.tree = new Tree(this.shapes)
        }

    }
    add(shape) {
        this.shapes.push(shape)
    }
    intersect(ray) {
        let s = this

        return s.tree.intersect(ray)
    }
    visible(eye, point) {
        let s = this
        if (s.projection == "perspective") {
            
            let v = eye.sub(point)
            let r = new Ray(point, v.normalize())
            let hit = this.intersect(r)

            return hit.t >= v.length()
        }
        else {
            let v = eye
            let r = new Ray(point, v.normalize())

            let hit = this.intersect(r)
            return !hit.ok()

        }
    }
    paths() {
        let result = []

        for (let shape of this.shapes) {
            // console.log(shape.paths())
            result.push(shape.paths())
        }
        return new Paths(result)
    }
    /**
     * 
     * @param {Vector} eye Where the camera looks from
     * @param {Vector} center of the scene
     * @param {Vector} up should be default z up (0,0,1)
     * @param {Number} width in pixels or units 
     * @param {Number} height in pixels or units
     * @param {Number} fovy field of view y
     * @param {Number} near near cut for line removal -- suggested values .1 or lower
     * @param {Number} far far cut for line removal -- suggested values 100 or more depending on distance of scene
     * @param {Number} step less than 1, this value is a multiplier, so to chop each line into ten segments one would use .1, higher values are slower but provide more accuracy
     * @returns {Paths}
     */
    render(eye, center, up, width, height, fovy, near, far, step) {
        let aspect = width / height
        let matrix = lookAt(eye, center, up)
        let matrix2
        if (this.projection == "perspective") {
            matrix2 = matrix.perspective(fovy, aspect, near, far)


        }
        else {
            matrix2 = matrix.orthographic(-1, 1, -1, 1, near, far)
        }
        return this.renderWithMatrix(matrix2, eye, width, height, step)
    }

    renderWithMatrix(matrix, eye, width, height, step) {


        this.compile()
        let paths = this.paths()
        this.stats.totalLines=paths.paths.length   
        if (step > 0) {
            paths = paths.chop(step)
        }

        paths = paths.filter(matrix, eye, this, step)

        this.stats.renderedLines= paths.paths.length

        if (step > 0) {

            paths = paths.simplify(1e-6)
        }
        this.stats.culledLines=paths.paths.length-this.stats.totalLines
        matrix = Translate(new Vector(1, 1, 0))
        matrix = matrix.scale(new Vector(width / 2, height / 2, 0))
        paths = paths.transform(matrix)
        return paths
    }
    

}

 