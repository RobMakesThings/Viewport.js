import { Box } from "./box.js"
import { Mesh } from "./mesh.js"
import { EPS } from "./common.js"
import { Vector, min, max } from './vector.js'
// import { Box } from './box.js'
import { Hit, noHit } from './hit.js'
import * as ease from '../examples/assets/easing.js'
import { Path, Paths } from './path.js'
import { Matrix, Scale, Translate } from "./matrix.js"
import { remap } from "./util.js"
/**
    * for use inside a {@link Mesh}
    * @param {Vector} v1 vertex 1
    * @param {Vector} v2 vertex 3
    * @param {Vector} v3 vertex 3
    */
export class Triangle {

    constructor(v1, v2, v3, color = "#000000") {/// have to pass a  vector 
        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
        this.box
        this.color = color

        this.updateBoundingBox()
    }
    updateBoundingBox() {
        let min = this.v1.min(this.v2)
        min = min.min(this.v3)
        let max = this.v1.max(this.v2)
        max = max.max(this.v3)
        this.box = new Box(min, max)
    }
    compile() {

    }
    boundingBox() {
        return this.box
    }
    contains(v, f) {
        return false
    }
    intersect(ray) {
        let t = this
        let e1x = t.v2.x - t.v1.x // edge 1 x 
        let e1y = t.v2.y - t.v1.y
        let e1z = t.v2.z - t.v1.z
        let e2x = t.v3.x - t.v1.x // edge 2 x 
        let e2y = t.v3.y - t.v1.y
        let e2z = t.v3.z - t.v1.z
        let px = ray.direction.y * e2z - ray.direction.z * e2y
        let py = ray.direction.z * e2x - ray.direction.x * e2z
        let pz = ray.direction.x * e2y - ray.direction.y * e2x

        let det = e1x * px + e1y * py + e1z * pz

        if (det > -EPS && det < EPS) {
            return noHit
        }
        let inv = 1.0 / det
        let tx = ray.origin.x - t.v1.x
        let ty = ray.origin.y - t.v1.y
        let tz = ray.origin.z - t.v1.z
        let u = (tx * px + ty * py + tz * pz) * inv
        if (u < 0 || u > 1) {
            return noHit
        }
        let qx = ty * e1z - tz * e1y
        let qy = tz * e1x - tx * e1z
        let qz = tx * e1y - ty * e1x
        let v = (ray.direction.x * qx + ray.direction.y * qy + ray.direction.z * qz) * inv

        if (v < 0 || u + v > 1) {
            return noHit
        }
        let d = (e2x * qx + e2y * qy + e2z * qz) * inv
        if (d < EPS) {
            return noHit
        }
        return new Hit(t, d)
    }
    paths(eye = null) {
        let t = this
        return this.oneTwoFill()
        return new Paths([
            new Path([t.v1, t.v2], this.color),
            new Path([t.v2, t.v3], this.color),
            new Path([t.v3, t.v1], this.color),
            // this.triSpiral()

        ]


        )

    }
    triShrinkShade(eye = null) {
        // console.log(this)
        let num = 12
        let paths = []
        let t = this
        // let edge1 = this.v1.sub(this.v2); let edge2 = this.v3.sub(this.v1)
        // let normal = edge1.cross(edge2)
        // normal = normal.normalize()
        let center = this.getCentroid()
        if (eye) {
            // console.log(center.x-eye.x,this.getArea())
            num = remap(center.x - eye.x, -400, 700, 5, 2)
            num = Math.random() * 15
        }
        // Scaling from individual origins of face. get centroid
        // move to center, subtract from center. 
        for (let i = 0; i <= num; i++) {
            let scalar = (remap(i, 0, num, .05, .99))

            let v1 = t.v1
            let v2 = t.v2
            let v3 = t.v3

            let m = new Matrix().translate(new Vector().sub(center))


            m = m.scale(new Vector(scalar, scalar, scalar))
            m = m.translate(center)

            let p1 = new Path([v1, v2], this.color).transform(m)
            let p2 = new Path([v2, v3], this.color).transform(m)
            let p3 = new Path([v3, v1], this.color).transform(m)
            paths.push(p1)
            paths.push(p2)
            paths.push(p3)
        }
        return new Paths(paths)
    }
    spiralFill() {// based on https://stackoverflow.com/questions/6824391/drawing-a-spiral-on-an-html-canvas-using-javascript
        let center = this.getCentroid()
        let paths = []
        // spiral from center out 
        let m = new Matrix().translate(new Vector().sub(center))

        let edge1 = this.v1.sub(this.v2); let edge2 = this.v3.sub(this.v1)
        let normal = edge1.cross(edge2)
        // m=m.rotate(normal,new Vector())
        // normal = normal.normalize()
        // m = m.scale(new Vector(scalar, scalar, scalar))

        m = m.rotate(normal, 0)
        m = m.translate(center)
        let a = .2; let b = .2;
        for (let i = 0; i < 360; i++) {
            let angle = 0.1 * i;
            let x = center.x + (a + b * angle) * Math.cos(angle);
            let y = center.y + (a + b * angle) * Math.sin(angle);
            let z = center.z + (a + b * angle) * Math.sin(angle)
            let p = new Vector(x, y, z)
            if (this.pointInPolygon(p)) {
                paths.push(p)

            }

        }
        // console.log(paths)
        return new Path(paths).transform(m)

    }
    oneTwoFill(){
        let num =3
        let paths = []
        // let rand = Math.random()
        let verts = [this.v1, this.v2, this.v3]
        // console.log(verts)

        verts.sort(function(a,b){return a.z - b.z})/// highest vert is darkest point? 
       
        for (let i=0; i<num; i++){
            let scalar = (remap(i, 0, num, 0, 1))
            // if(rand<.33){
            // paths.push(new Path([this.v1,this.v2.lerp(this.v3,scalar)],this.color))

            // }
            // else if (rand>.33&&rand<.66){
            // paths.push(new Path([this.v2,this.v1.lerp(this.v3,scalar)],this.color))

            // }
            // else if(rand>.66) {
            // paths.push(new Path([this.v3,this.v2.lerp(this.v1,scalar)],this.color))

            // }
            // paths.push(new Path([verts[0],verts[1].lerp(verts[2],scalar)],this.color))

            paths.push(new Path([this.v3,this.v2.lerp(this.v1,scalar)],this.color))

            paths.push(new Path([this.v1,this.v2.lerp(this.v3,scalar)],this.color))
        }
        return new Paths(paths)
    }
    triSpiral() {
        /// 
        let num = 30//turns to center
        let paths = []

        let center = this.getCentroid()

        // start at first vertex scale down to scalar 2nd vert, next, scalar 3rd vert, so onabort. 
        let verts = [this.v1, this.v2, this.v3]
        // Scaling from individual origins of face. get centroid


        for (let i = 0; i <= num; i++) {/// probably 
            let scalar = (remap(i, 0, num, .05, .99))
            let vert = verts[i % verts.length]

            scalar = ease.easeInOutQuad(scalar)

            let v = vert


            let m = new Matrix().translate(new Vector().sub(center))


            m = m.scale(new Vector(scalar, scalar, scalar))
            m = m.translate(center)
            let p1 = new Path([vert], this.color).transform(m)

            paths.push(p1)
        }
        let result = []
        for (let path of paths) {
            result.push(...path.verts)

        }
        // console.log(result)
        return new Path(result,this.color)

    }
    hatchFill() { }


    getCentroid(v1 = this.v1, v2 = this.v2, v3 = this.v3) {
        return new Vector(
            (v1.x + v2.x + v3.x) / 3,
            (v1.y + v2.y + v3.y) / 3,
            (v1.z + v2.z + v3.z) / 3)


    }
    getArea() {
        const crossProduct = new Vector(
            this.v1.y * this.v2.z - this.v1.z * this.v2.y,
            this.v1.z * this.v2.x - this.v1.x * this.v2.z,
            this.v1.x * this.v2.y - this.v1.y * this.v2.x
        )
        const magnitude = Math.sqrt(crossProduct.x * crossProduct.x + crossProduct.y * crossProduct.y + crossProduct.z * crossProduct.z);
        return .5 * magnitude

    }
    pointInPolygon(point, vertices = [this.v1, this.v2, this.v3]) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            if (((vertices[i].y > point.y) !== (vertices[j].y > point.y)) &&
                (point.x < (vertices[j].x - vertices[i].x) * (point.y - vertices[i].y) /
                    (vertices[j].y - vertices[i].y) + vertices[i].x)) {
                inside = !inside;
            }
        }
        return inside;
    }

}

