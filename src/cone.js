import './viewport.js'
import { Vector } from './vector.js'
import { Box } from './box.js'
import { Path, Paths } from './path.js'
import { radians } from './util.js'
import { Hit, noHit } from './hit.js'
import { TransformedShape } from './viewport.js'
/**
     * 
    *defines a cone placed at center. it must be transformed around scene with another class
     * to place a cone somwhere, transform it with new {@link TransformedShape}
     *@see  {@link TransformedShape}
     * @param {Number} radius 
     * @param {Number} height of cone
     */
export class Cone {
    
    constructor(radius, height) {
        this.radius = radius
        this.height = height
    }
    compile() {

    }
    boundingBox() {
        let r = this.radius
        let c = this
        return new Box(new Vector(-r, -r, 0), new Vector(r, r, c.height))

    }
    contains(v, f) {///  needs to be implemented for this to work with csg
        return false
    }
    intersect(ray) {
        let shape = this
        let o = ray.origin
        let d = ray.direction
        let r = shape.radius
        let h = shape.height

        let k = r / h
        k = k * k

        let a = d.x * d.x + d.y * d.y - k * d.z * d.z
        let b = 2 * (d.x * o.x + d.y * o.y - k * d.z * (o.z - h))
        let c = o.x * o.x + o.y * o.y - k * (o.z - h) * (o.z - h)
        let q = b * b - 4 * a * c

        if (q <= 0) {
            return noHit
        }
        let s = Math.sqrt(q)
        let t0 = (-b + s) / (2 * a)
        let t1 = (-b - s) / (2 * a)

        if (t0 > t1) {
            let temp = t0
            t0 = t1
            t1 = temp
        }

        if (t0 > 1e-6) {
            let p = ray.position(t0)

            if (p.z > 0 && p.z < h) {

                return new Hit(shape, t0)
            }
        }
        if (t1 > 1e-6) {
            let p = ray.position(t1)
            if (p.z > 0 && p.z < h) {
                return new Hit(shape, t1)
            }
        }
        return noHit

    }
    paths() {
        let result = []
        for (let a = 0; a < 360; a += 30) {
            let x = this.radius * Math.cos(radians(a))
            let y = this.radius * Math.sin(radians(a))
            result.push(new Path([
                new Vector(x, y, 0), new Vector(0, 0, this.height)
            ]))
        }
        return new Paths(result)
    }
}

export class OutlineCone extends Cone {
    /**Draws just the outer lines of a cone
     *@see {@link newTransformedOutlineCone}
     * @param {Number} radius 
     * @param {Number} height 
     * @param {Vector} eye 
     * @param {Vector} up 
     * 
     */
    constructor(radius, height, eye, up) {
        super(radius, height)
        this.eye = eye
        this.up = up
    }
    paths() {
        let c = this
        let center = new Vector(0, 0, 0)
        let hyp = center.sub(c.eye).length()
        let opp = c.radius
        let theta = Math.asin(opp / hyp)
        let adj = opp / Math.tan(theta)
        let d = Math.cos(theta) * adj
        // r := math.Sin(theta) * adj
        let w = center.sub(c.eye).normalize()
        let u = w.cross(c.up).normalize()
        let c0 = c.eye.add(w.mulScalar(d))
        let a0 = c0.add(u.mulScalar(c.radius * 1.01))
        let b0 = c0.add(u.mulScalar(-c.radius * 1.01))
        let p0 = []
        for (let a = 0; a < 360; a++) {
            let x = c.radius * Math.cos(radians(a))
            let y = c.radius * Math.sin(radians(a))
            p0.push(new Vector(x, y, 0))
        }
        return new Paths([
            new Path(p0),
            new Path([new Vector(a0.x, a0.y, 0), new Vector(0, 0, c.height)]),
            new Path([new Vector(b0.x, b0.y, 0), new Vector(0, 0, c.height)])
        ])

    }
}
/**
 * Draws The outline of a cone from the perspective of camera anwhere you want it as a transformed shape
 * @param {Vector} eye 
 * @param {Vector} up 
 * @param {Vector} v0 
 * @param {Vector} v1 
 * @param {float} radius 
 * @returns New transfromed shape with outline cone of said parameters
 */
export function newTransformedOutlineCone(eye, up, v0, v1, radius) {
    let d = v1.sub(v0)
    let z = d.length()
    let a = Math.acos(d.normalize().dot(up))
    let m = Translate(v0)
    if (a != 0) {
        let u = d.cross(up).normalize()
        m = Rotate(u, a).translate(v0)
    }
    let c = new OutlineCone(radius, z, m.inverse().mulPosition(eye), up)
    return new TransformedShape(c, m)
}