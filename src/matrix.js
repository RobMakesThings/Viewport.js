import { Vector } from "./vector.js";
import { PI } from "./common.js"
import { Box } from "./box.js";
import { Ray } from "./ray.js";
/**
 * Matrix class for transforming paths and shapes. 
 */
export class Matrix {
    constructor(data = null) {
        if (data) {
            this.m = data;
        } else {
            this.m = [
                [1, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 1, 0],
                [0, 0, 0, 1]
            ];
        }
        this.x00 = this.m[0][0]; this.x01 = this.m[0][1]; this.x02 = this.m[0][2]; this.x03 = this.m[0][3];
        this.x10 = this.m[1][0]; this.x11 = this.m[1][1]; this.x12 = this.m[1][2]; this.x13 = this.m[1][3];
        this.x20 = this.m[2][0]; this.x21 = this.m[2][1]; this.x22 = this.m[2][2]; this.x23 = this.m[2][3];
        this.x30 = this.m[3][0]; this.x31 = this.m[3][1]; this.x32 = this.m[3][2]; this.x33 = this.m[3][3];
    }

    static identity() {
        return new Matrix();
    }
    /**
     * returns new matrix translated 
     * @param {Vector} v 
     * @returns {Matrix} new matrix 
     */
    translate(v) {
        v = Translate(v)
        v = v.mult(this)
        return v
    }
       /**
     * returns new matrix scaled 
     * @param {Vector} v 
     * @returns {Matrix} new matrix 
     */
    scale(v) {
        v = Scale(v)
        v = v.mult(this)
        return v

    }
     /**
     * returns new matrix rotated 
     * @param {Vector} v 
     * @returns {Matrix} new matrix 
     */
    rotate(v, a) {
        return Rotate(v, a).mult(this)
    }
    frustrum(l, r, b, t, n, f) {
        let matrix = frustrum(l, r, b, t, n, f)
        matrix = matrix.mult(this)
        return matrix
    }
    orthographic(l, r, b, t, n, f) {

        let m = orthographic(l, r, b, t, n, f)
        m = m.mult(this)
        return m
    }
    perspective(fovy, aspect, near, far) {
        let m = perspective(fovy, aspect, near, far)

        m = m.mult(this)

        return m
    }
     /**
     * returns new matrix multiplied by input matrix 
     * @param {Matrix} 
     * @returns {Matrix} new matrix 
     */
    mult(b) {
        let m = new Matrix()
        let a = this
        m.x00 = a.x00 * b.x00 + a.x01 * b.x10 + a.x02 * b.x20 + a.x03 * b.x30
        m.x10 = a.x10 * b.x00 + a.x11 * b.x10 + a.x12 * b.x20 + a.x13 * b.x30
        m.x20 = a.x20 * b.x00 + a.x21 * b.x10 + a.x22 * b.x20 + a.x23 * b.x30
        m.x30 = a.x30 * b.x00 + a.x31 * b.x10 + a.x32 * b.x20 + a.x33 * b.x30
        m.x01 = a.x00 * b.x01 + a.x01 * b.x11 + a.x02 * b.x21 + a.x03 * b.x31
        m.x11 = a.x10 * b.x01 + a.x11 * b.x11 + a.x12 * b.x21 + a.x13 * b.x31
        m.x21 = a.x20 * b.x01 + a.x21 * b.x11 + a.x22 * b.x21 + a.x23 * b.x31
        m.x31 = a.x30 * b.x01 + a.x31 * b.x11 + a.x32 * b.x21 + a.x33 * b.x31
        m.x02 = a.x00 * b.x02 + a.x01 * b.x12 + a.x02 * b.x22 + a.x03 * b.x32
        m.x12 = a.x10 * b.x02 + a.x11 * b.x12 + a.x12 * b.x22 + a.x13 * b.x32
        m.x22 = a.x20 * b.x02 + a.x21 * b.x12 + a.x22 * b.x22 + a.x23 * b.x32
        m.x32 = a.x30 * b.x02 + a.x31 * b.x12 + a.x32 * b.x22 + a.x33 * b.x32
        m.x03 = a.x00 * b.x03 + a.x01 * b.x13 + a.x02 * b.x23 + a.x03 * b.x33
        m.x13 = a.x10 * b.x03 + a.x11 * b.x13 + a.x12 * b.x23 + a.x13 * b.x33
        m.x23 = a.x20 * b.x03 + a.x21 * b.x13 + a.x22 * b.x23 + a.x23 * b.x33
        m.x33 = a.x30 * b.x03 + a.x31 * b.x13 + a.x32 * b.x23 + a.x33 * b.x33
        return m
    }
    /**
     * multiplies input vector b matrix.mulPosistion(b)
     * @param {Vector} b 
     * @returns {Vector} 
     */
    mulPosition(b) {
        let a = this
        let x = a.x00*b.x + a.x01*b.y + a.x02*b.z + a.x03
        let y = a.x10*b.x + a.x11*b.y + a.x12*b.z + a.x13
        let z = a.x20*b.x + a.x21*b.y + a.x22*b.z + a.x23

        return new Vector(x, y, z)

    }
    mulPositionW(b) {
        let a = this
        let x = a.x00 * b.x + a.x01 * b.y + a.x02 * b.z + a.x03
        let y = a.x10 * b.x + a.x11 * b.y + a.x12 * b.z + a.x13
        let z = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z + a.x23
        let w = a.x30 * b.x + a.x31 * b.y + a.x32 * b.z + a.x33
        return new Vector(x / w, y / w, z / w)

    }
    mulDirection(b) {
        let a = this
        let x = a.x00 * b.x + a.x01 * b.y + a.x12 * b.z
        let y = a.x10* b.x + a.x11 * b.y + a.x12 * b.z
        let z = a.x20 * b.x + a.x21 * b.y + a.x22 * b.z
        let out = new Vector(x, y, z)
        out= out.normalize()
        return out
    }
    mulRay(ray) {
        let a = this
        let b = ray
        return new Ray(a.mulPosition(b.origin), a.mulDirection(b.direction))
    }
    mulBox(box) {
        let a = this
        let r = new Vector(a.x00, a.x10, a.x20)
        let u = new Vector(a.x01, a.x11, a.x21)
        let b = new Vector(a.x02, a.x12, a.x22)
        let t = new Vector(a.x03, a.x13, a.x23)
        let xa = r.mulScalar(box.min.x)
        let xb = r.mulScalar(box.max.x)
        let ya = u.mulScalar(box.min.y)
        let yb = u.mulScalar(box.max.y)
        let za = b.mulScalar(box.min.z)
        let zb = b.mulScalar(box.max.z)
        let temp = xa
        xa = xa.min(xb); xb=temp.max(xb)
        temp = ya
        ya = ya.min(yb); yb= temp.max(yb)
        temp = za
        za = za.min(zb); zb = temp.max(zb)
        let min = xa.add(ya).add(za).add(t)
        let max = xb.add(yb).add(zb).add(t)
        return new Box(min, max)

    }
    transpose() {
        let a = this

        return new Matrix * ([
            [a.x00, a.x10, a.x20, a.x30],
            [a.x01, a.x11, a.x21, a.x31],
            [a.x02, a.x12, a.x22, a.x32],
            [a.x03, a.x13, a.x23, a.x33]
        ])
    }
    determinant() {
        /// returns float?
        let a = this
        return (a.x00 * a.x11 * a.x22 * a.x33 - a.x00 * a.x11 * a.x23 * a.x32 +
            a.x00 * a.x12 * a.x23 * a.x31 - a.x00 * a.x12 * a.x21 * a.x33 +
            a.x00 * a.x13 * a.x21 * a.x32 - a.x00 * a.x13 * a.x22 * a.x31 -
            a.x01 * a.x12 * a.x23 * a.x30 + a.x01 * a.x12 * a.x20 * a.x33 -
            a.x01 * a.x13 * a.x20 * a.x32 + a.x01 * a.x13 * a.x22 * a.x30 -
            a.x01 * a.x10 * a.x22 * a.x33 + a.x01 * a.x10 * a.x23 * a.x32 +
            a.x02 * a.x13 * a.x20 * a.x31 - a.x02 * a.x13 * a.x21 * a.x30 +
            a.x02 * a.x10 * a.x21 * a.x33 - a.x02 * a.x10 * a.x23 * a.x31 +
            a.x02 * a.x11 * a.x23 * a.x30 - a.x02 * a.x11 * a.x20 * a.x33 -
            a.x03 * a.x10 * a.x21 * a.x32 + a.x03 * a.x10 * a.x22 * a.x31 -
            a.x03 * a.x11 * a.x22 * a.x30 + a.x03 * a.x11 * a.x20 * a.x32 -
            a.x03 * a.x12 * a.x20 * a.x31 + a.x03 * a.x12 * a.x21 * a.x30)


    }
    inverse() {
        let a = this
        let m = new Matrix()
        let d = a.determinant()

        m.x00 = (a.x12 * a.x23 * a.x31 - a.x13 * a.x22 * a.x31 + a.x13 * a.x21 * a.x32 - a.x11 * a.x23 * a.x32 - a.x12 * a.x21 * a.x33 + a.x11 * a.x22 * a.x33) / d
        m.x01 = (a.x03 * a.x22 * a.x31 - a.x02 * a.x23 * a.x31 - a.x03 * a.x21 * a.x32 + a.x01 * a.x23 * a.x32 + a.x02 * a.x21 * a.x33 - a.x01 * a.x22 * a.x33) / d
        m.x02 = (a.x02 * a.x13 * a.x31 - a.x03 * a.x12 * a.x31 + a.x03 * a.x11 * a.x32 - a.x01 * a.x13 * a.x32 - a.x02 * a.x11 * a.x33 + a.x01 * a.x12 * a.x33) / d
        m.x03 = (a.x03 * a.x12 * a.x21 - a.x02 * a.x13 * a.x21 - a.x03 * a.x11 * a.x22 + a.x01 * a.x13 * a.x22 + a.x02 * a.x11 * a.x23 - a.x01 * a.x12 * a.x23) / d
        m.x10 = (a.x13 * a.x22 * a.x30 - a.x12 * a.x23 * a.x30 - a.x13 * a.x20 * a.x32 + a.x10 * a.x23 * a.x32 + a.x12 * a.x20 * a.x33 - a.x10 * a.x22 * a.x33) / d
        m.x11 = (a.x02 * a.x23 * a.x30 - a.x03 * a.x22 * a.x30 + a.x03 * a.x20 * a.x32 - a.x00 * a.x23 * a.x32 - a.x02 * a.x20 * a.x33 + a.x00 * a.x22 * a.x33) / d
        m.x12 = (a.x03 * a.x12 * a.x30 - a.x02 * a.x13 * a.x30 - a.x03 * a.x10 * a.x32 + a.x00 * a.x13 * a.x32 + a.x02 * a.x10 * a.x33 - a.x00 * a.x12 * a.x33) / d
        m.x13 = (a.x02 * a.x13 * a.x20 - a.x03 * a.x12 * a.x20 + a.x03 * a.x10 * a.x22 - a.x00 * a.x13 * a.x22 - a.x02 * a.x10 * a.x23 + a.x00 * a.x12 * a.x23) / d
        m.x20 = (a.x11 * a.x23 * a.x30 - a.x13 * a.x21 * a.x30 + a.x13 * a.x20 * a.x31 - a.x10 * a.x23 * a.x31 - a.x11 * a.x20 * a.x33 + a.x10 * a.x21 * a.x33) / d
        m.x21 = (a.x03 * a.x21 * a.x30 - a.x01 * a.x23 * a.x30 - a.x03 * a.x20 * a.x31 + a.x00 * a.x23 * a.x31 + a.x01 * a.x20 * a.x33 - a.x00 * a.x21 * a.x33) / d
        m.x22 = (a.x01 * a.x13 * a.x30 - a.x03 * a.x11 * a.x30 + a.x03 * a.x10 * a.x31 - a.x00 * a.x13 * a.x31 - a.x01 * a.x10 * a.x33 + a.x00 * a.x11 * a.x33) / d
        m.x23 = (a.x03 * a.x11 * a.x20 - a.x01 * a.x13 * a.x20 - a.x03 * a.x10 * a.x21 + a.x00 * a.x13 * a.x21 + a.x01 * a.x10 * a.x23 - a.x00 * a.x11 * a.x23) / d
        m.x30 = (a.x12 * a.x21 * a.x30 - a.x11 * a.x22 * a.x30 - a.x12 * a.x20 * a.x31 + a.x10 * a.x22 * a.x31 + a.x11 * a.x20 * a.x32 - a.x10 * a.x21 * a.x32) / d
        m.x31 = (a.x01 * a.x22 * a.x30 - a.x02 * a.x21 * a.x30 + a.x02 * a.x20 * a.x31 - a.x00 * a.x22 * a.x31 - a.x01 * a.x20 * a.x32 + a.x00 * a.x21 * a.x32) / d
        m.x32 = (a.x02 * a.x11 * a.x30 - a.x01 * a.x12 * a.x30 - a.x02 * a.x10 * a.x31 + a.x00 * a.x12 * a.x31 + a.x01 * a.x10 * a.x32 - a.x00 * a.x11 * a.x32) / d

        m.x33 = (a.x01 * a.x12 * a.x20 - a.x02 * a.x11 * a.x20 + a.x02 * a.x10 * a.x21 - a.x00 * a.x12 * a.x21 - a.x01 * a.x10 * a.x22 + a.x00 * a.x11 * a.x22) / d
        return m
    }



}
/**
 * return translated matrix
 * @param {Vector} v 
 * @returns {Matrix}
 */
export function Translate(v) {
    return new Matrix(
        [
            [1, 0, 0, v.x],
            [0, 1, 0, v.y],
            [0, 0, 1, v.z],
            [0, 0, 0, 1]
        ]
    )

}
/**
 * return scaled matrix
 * @param {Vector} v 
 * @returns {Matrix}
 */
export function Scale(v) {
    return new Matrix(
        [
            [v.x, 0, 0, 0],
            [0, v.y, 0, 0],
            [0, 0, v.z, 0],
            [0, 0, 0, 1]
        ]
    )

}
/**
 * 
 * @param {Vector} v 
 * @param {Number} a Angle in radians or use radians(90) to translate degrees
 * @returns {Matrix}
 */
export function Rotate(v, a) {
    v = v.normalize()
    let s = Math.sin(a)
    let c = Math.cos(a)
    let m = 1 - c
    return new Matrix(
        [
            [m * v.x * v.x + c, m * v.x * v.y + v.z * s, m * v.z * v.z * v.x - v.y * s, 0],
            [m * v.x * v.y - v.z * s, m * v.y * v.y + c, m * v.y * v.z + v.x * s, 0],
            [m * v.z * v.x + v.y * s, m * v.y * v.z - v.x * s, m * v.z * v.z + c, 0],
            [0, 0, 0, 1]
        ]
    )
}

export function frustrum(l, r, b, t, n, f) {
    // left , right , back , top , near , far
    let t1 = 2 * n
    let t2 = r - l
    let t3 = t - b
    let t4 = f - n
    let m = new Matrix([
        [t1 / t2, 0, (r + l) / t2, 0],
        [0, t1 / t3, (t + b) / t3, 0],
        [0, 0, (-f - n) / t4, (-t1 * f) / t4],
        [0, 0, -1, 0]
    ])
    // console.log(m)
    return m
}
export function orthographic(l, r, b, t, n, f) {
    return new Matrix([
        [2 / (r - l), 0, 0, -(r + l) / (r - l)],
        [0, 2 / (t - b), 0, -(t + b) / (t - b)],
        [0, 0, -2 / (f - n), -(f + n) / (f - n)],
        [0, 0, 0, 1]
    ])
}

export function perspective(fovy, aspect, near, far) {
    let ymax = near * Math.tan(fovy * PI / 360)
    let xmax = ymax * aspect
    // console.log("at perspective", frustrum(-xmax, xmax, -ymax, ymax, near, far))

    return frustrum(-xmax, xmax, -ymax, ymax, near, far)
}

export function lookAt(eye, center, up) {
    up = up.normalize()
    let f = center.sub(eye)
    let s = f.cross(up)
    let u = s.cross(f)

    f = f.normalize(); s = s.normalize(); u = u.normalize()

    let m = new Matrix([
        [s.x, u.x, -f.x, eye.x],
        [s.y, u.y, -f.y, eye.y],
        [s.z, u.z, -f.z, eye.z],
        [0, 0, 0, 1]
    ])
    return m.inverse()
}