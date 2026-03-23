import { Vector } from "./vector.js"
import { Triangle } from "./triangle.js"
import { Mesh } from "./mesh.js"
/**
 * a shard is like to two pyramids stacked on top of each other
     * @param {Number} a -- Width from center to back
     * @param {Number} b -- width from center to front
     * @param {Number} h1 -- height from center to bottom
     * 
     * @param {Number} h2 -- height from center to top
     */
export class Shard {/// shard is like diamond kinda thing, made of triangles  / mesh so can be tranformed using those classes tools , fit inside etc

    constructor(a, b, h1, h2) {
        this.color = "#000000"
        this.p1 = new Vector(a / 2, -b / 2, 0)
        this.p2 = new Vector(a / 2, b / 2, 0)
        this.p3 = new Vector(-a / 2, b / 2, 0)
        this.p4 = new Vector(-a / 2, -b / 2, 0)
        this.ph1 = new Vector(0, 0, h1)
        this.ph2 = new Vector(0, 0, h2)



        /// top 4 pyramid faces
        let t1 = new Triangle(this.p1, this.p2, this.ph1)
        let t2 = new Triangle(this.p2, this.p3, this.ph1)
        let t3 = new Triangle(this.p3, this.p4, this.ph1)
        let t4 = new Triangle(this.p4, this.p1, this.ph1)
        //bottom
        let t5 = new Triangle(this.p1, this.p2, this.ph2)
        let t6 = new Triangle(this.p2, this.p3, this.ph2)
        let t7 = new Triangle(this.p3, this.p4, this.ph2)
        let t8 = new Triangle(this.p4, this.p1, this.ph2)
        let triangles = [t1, t2, t3, t4, t5, t6, t7, t8]
        let mesh = new Mesh(triangles)
        this.mesh = mesh

    }
    boundingBox() {
        return this.mesh.boundingBox()
    }
    compile() {
        this.mesh.compile()
    }
    contains(v, f) {
        return false
    }
    intersect(ray) {
        return this.mesh.intersect(ray)
    }
    paths() {
        let paths = this.mesh.paths()
        return paths
    }
}