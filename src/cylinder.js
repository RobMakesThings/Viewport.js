import './viewport.js'
import { Vector } from './vector.js'
import { Box } from './box.js'
import { Path, Paths } from './path.js'
import { Hit, noHit } from './hit.js'
import { radians } from './util.js'
import { TransformedShape } from './viewport.js'


/**
  * Cylinder drawing from center. Can be transformed with TransformedShape
* 
  * 
  * @param {Number} radius 
  * @param {Number} z0 bottom of cylinder 
  * @param {Number} z1 top of cylinder
  */
export class Cylinder {

    constructor(radius, z0, z1) {
        this.radius = radius
        this.z0 = z0
        this.z1 = z1
    }
    compile() {

    }
    boundingBox() {
        let r = this.radius
        let c = this
        return new Box(new Vector(-r, -r, c.z0), new Vector(r, r, c.z1))
    }
    contains(v, f) {
        let c = this

        let xy = new Vector(v.x, v.y, 0)

        if (xy.length() > c.radius + f) {

            return false
        }
        return v.z >= (c.z0 - f) && v.z <= (c.z1 + f)
    }
    intersect(ray) {
        let shape = this
        let r = shape.radius
        let o = ray.origin
        let d = ray.direction
        let a = d.x * d.x + d.y * d.y
        let b = 2 * o.x * d.x + 2 * o.y * d.y
        let c = o.x * o.x + o.y * o.y - r * r
        let q = b * b - 4 * a * c
        if (q < 0) {
            // console.log("exit early q")

            return noHit
        }
        let s = Math.sqrt(q)
        // console.log(s, "s")
        let t0 = (-b + s) / (2 * a)
        let t1 = (-b - s) / (2 * a)

        if (t0 > t1) {
            let temp = t0
            t0 = t1
            t1 = temp
        }

        let z0 = o.z + t0 * d.z
        let z1 = o.z + t1 * d.z
        // console.log(z0,z1,"z0,z 1")

        if ((t0 > 1e-6) && (shape.z0 < z0) && (z0 < shape.z1)) {
            return new Hit(shape, t0)
        }
        if (t1 > 1e-6 && shape.z0 < z1 && z1 < shape.z1) {

            return new Hit(shape, t1)
        }
        return noHit
    }
    paths() {
        let c = this
        let result = []
        for (let a = 0; a < 360; a += 10) {
            let x = c.radius * Math.cos(radians(a))
            let y = c.radius * Math.sin(radians(a))
            result.push(new Path([new Vector(x, y, c.z0), new Vector(x, y, c.z1)]))
        }
        return new Paths(result)
    }
}
/**
 * 
 * @see {@link newTransformedOutlineCylinder } instead of creating here
 * @param {Vector} eye 
 * @param {Vector} up 
 * @param {Number} v0 
 * @param {Number} v1 
 * @param {Number} radius 
 * @returns {TransformedShape}
 */
export class OutlineCylinder extends Cylinder {
    constructor(eye, up, radius, z0, z1) {
        super(radius, z0, z1)
        this.eye = eye
        this.up = up
    }
    paths() {
        let c = this
        let center = new Vector(0, 0, c.z0)
        let hyp = center.sub(this.eye).length()
        let opp = c.radius
        let theta = Math.asin(opp / hyp)
        let adj = opp / Math.tan(theta)
        let d = Math.cos(theta) * adj
        // let r = Math.sin(theta)*adj 

        let w = center.sub(c.eye)
        w = w.normalize()
        let u = w.cross(c.up)
        u = u.normalize()
        let c0 = c.eye.add(w.mulScalar(d))
        let a0 = c0.add(u.mulScalar(c.radius * 1.01))
        let b0 = c0.add(u.mulScalar(-c.radius * 1.01))


        center = new Vector(0, 0, c.z1)
        hyp = center.sub(this.eye).length()
        opp = c.radius
        theta = Math.asin(opp / hyp)
        adj = opp / Math.tan(theta)
        d = Math.cos(theta) * adj
        // let r = Math.sin(theta)*adj 
        w = center.sub(c.eye)
        w = w.normalize()
        u = w.cross(c.up)
        u = u.normalize()
        let c1 = c.eye.add(w.mulScalar(d))
        let a1 = c1.add(u.mulScalar(c.radius * 1.01))
        let b1 = c1.add(u.mulScalar(-c.radius * 1.01))

        let p0 = []
        let p1 = []//top circle, other is bottom

        for (let a = 0; a < 360; a++) {// every ten degrees
            let x = c.radius * Math.cos(radians(a))
            let y = c.radius * Math.sin(radians(a))
            p0.push(new Vector(x, y, c.z0))

            p1.push(new Vector(x, y, c.z1))



        }
        return new Paths([
            new Path(p0),
            new Path(p1),
            new Path([new Vector(a0.x, a0.y, c.z0), new Vector(a1.x, a1.y, c.z1)]),
            new Path([new Vector(b0.x, b0.y, c.z0), new Vector(b1.x, b1.y, c.z1)])

        ])







    }
}
/**
 *
 * 
 * @param {Vector} eye 
 * @param {Vector} up 
 * @param {Vector} v0 
 * @param {Vector} v1 
 * @param {Number} radius 
 * @returns {TransformedShape}
 */
export function newTransformedOutlineCylinder(eye, up, v0, v1, radius) {
    let d = v1.sub(v0)
    let z = d.length()
    let a = Math.acos(d.normalize().dot(up))
    let m = Translate(v0)
    if (a != 0) {
        let u = d.cross(up).normalize()
        m = Rotate(u, a).translate(v0)
    }
    let c = new OutlineCylinder(m.inverse().mulPosition(eye), up, radius, 0, z)
    return new TransformedShape(c, m)

}