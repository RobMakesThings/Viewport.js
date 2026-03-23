import './viewport.js'
import { Vector ,max,min} from './vector.js'
import { Box } from './box.js'
import { Path,Paths } from './path.js'
import { Hit,noHit } from './hit.js'
import { remap } from './util.js'
 /**
     * Draw Cube primitive 
     * @param {Vector} min 
     * @param {Vector} max 
     * defaults to cube of 2 in size
     * min = new Vector(-1, -1, -1), max = new Vector(1, 1, 1)
     */
export class Cube {
   
    constructor(min = new Vector(-1, -1, -1), max = new Vector(1, 1, 1)) {
        this.min = min
        this.max = max
        this.box = new Box(this.min, this.max)
        this.color = "#000000"


    }

    boundingBox() {
        return this.box
    }

    contains(v, f) {
        let c = this

        

        
        if (v.x < c.min.x - f || v.x > c.max.x + f) {
            return false
        }
        if (v.y < c.min.y - f || v.y > c.max.y + f) {
            return false
        }
        if (v.z < c.min.z - f || v.z > c.max.z + f) {
            return false
        }
        return true
    }

    intersect(ray) {
        let c = this
        
        let n = c.min.sub(ray.origin).div(ray.direction)
       
        let f = c.max.sub(ray.origin).div(ray.direction)
       
        let temp = n
        n = n.min(f)
        f = temp.max(f)
       
        let t0 = max(max(n.x, n.y), n.z)
        let t1 = min(min(f.x, f.y), f.z)
        if ((t0 < 1e-3) && (t1 > 1e-3)) {

            return new Hit(c, t1)
        }
        if ((t0 >= 1e-3) && (t0 < t1)) {

            return new Hit(c, t0)
        }
        return noHit

    }

    paths() {// default paths function here takes each vertex and maxes a cube out of four faces with four vertexes each? 24 lines, 12 pairs of vertexes
        let c = this
        let x1 = c.min.x, y1 = c.min.y, z1 = c.min.z
        let x2 = c.max.x, y2 = c.max.y, z2 = c.max.z
        // let paths = new Paths/// fuck idk what a path is yet
        let result = []
        let paths = [
            [[x1, y1, z1], [x1, y1, z2]],
            [[x1, y1, z1], [x1, y2, z1]],
            [[x1, y1, z1], [x2, y1, z1]],
            [[x1, y1, z2], [x1, y2, z2]],
            [[x1, y1, z2], [x2, y1, z2]],
            [[x1, y2, z1], [x1, y2, z2]],
            [[x1, y2, z1], [x2, y2, z1]],
            [[x1, y2, z2], [x2, y2, z2]],
            [[x2, y1, z1], [x2, y1, z2]],
            [[x2, y1, z1], [x2, y2, z1]],
            [[x2, y1, z2], [x2, y2, z2]],
            [[x2, y2, z1], [x2, y2, z2]]
        ]
        for (let line of paths) {
            let a = line[0]
            let b = line[1]
            line[0] = new Vector(a[0], a[1], a[2])
            line[1] = new Vector(b[0], b[1], b[2])
            result.push(new Path([line[0], line[1]]),this.color)
        }

        return new Paths(result)
    }

}
/**
     * 
     * Hatched/striped cube
     * @param {Vector} min 
     * @param {Vector} max 
     * @param {Number} stripesX stripes to draw in x direction, is affected by percent x 
     * @param {Number} stripesY ""but for y
     * @param {Number} stripesZ you get it
     * @param {Number} px  percent of stripes x , y or z. 0-1 
     * @param {Number} py 
     * @param {Number} pz 
     */
export class StripedCube extends Cube {
    
    constructor(min, max, stripesX, stripesY, stripesZ, px, py, pz) {
        super(min, max)
        this.stripesX = stripesX
        this.stripesY = stripesY
        this.color = "#000000"

        this.stripesZ = stripesZ
        this.px = px /// px is percent x 
        this.py = py
        this.pz = pz

    }
    paths() {
        let paths = []
        let c = this
        let x1 = c.min.x; let y1 = c.min.y; let z1 = c.min.z
        let x2 = c.max.x; let y2 = c.max.y; let z2 = c.max.z
        let xlen = x2 - x1
        let ylen = y2 - y1
        let zlen = z2 - z1

        //along x 
        for (let i = 1; i < c.stripesX; i++) {
            let p = remap(i, 0, c.stripesX, 0, 1)
            let ry = Math.random() * (y2 - y1) * c.py
            let rz = Math.random() * (z2 - z1) * c.pz
            let px = p * xlen + x1

            paths.push([[px, y1 + ry, z1], [px, y1, z1], [px, y1, z1 + rz]])

            paths.push([[px, y1, z2 - rz], [px, y1, z2], [px, y1 + ry, z2]])

            paths.push([[px, y2 - ry, z2], [px, y2, z2], [px, y2, z2 - rz]])

            paths.push([[px, y2, z1 + rz], [px, y2, z1], [px, y2 - ry, z1]])



        }
        // along y 
        for (let i = 1; i < c.stripesY; i++) {
            let p = remap(i, 0, c.stripesY, 0, 1)
            let rx = Math.random() * (x2 - x1) * c.px
            let rz = Math.random() * (z2 - z1) * c.pz
            let py = p * ylen + y1

            paths.push([[x1 + rx, py, z1], [x1, py, z1], [x1, py, z1 + rz]])

            paths.push([[x1, py, z2 - rz], [x1, py, z2], [x1 + rx, py, z2]])

            paths.push([[x2 - rx, py, z2], [x2, py, z2], [x2, py, z2 - rz]])

            paths.push([[x2, py, z1 + rz], [x2, py, z1], [x2 - rx, py, z1]])
        }

        for (let i = 1; i < c.stripesZ; i++) {
            let p = remap(i, 0, c.stripesZ, 0, 1)
            let rx = Math.random() * (x2 - x1) * c.px
            let ry = Math.random() * (y2 - y1) * c.py
            let pz = p * zlen + z1


            paths.push([[x1 + rx, y1, pz], [x1, y1, pz], [x1, y1 + ry, pz]])

            paths.push([[x1, y2 - ry, pz], [x1, y2, pz], [x1 + rx, y2, pz]])

            paths.push([[x2 - rx, y2, pz], [x2, y2, pz], [x2, y2 - ry, pz]])

            paths.push([[x2, y1 + ry, pz], [x2, y1, pz], [x2 - rx, y1, pz]])


        }
        let result = []
        for (let line of paths) {
            let a = line[0]
            let b = line[1]
            let c = line[2]
            line[0] = new Vector(a[0], a[1], a[2])
            line[1] = new Vector(b[0], b[1], b[2])
            line[2] = new Vector(c[0], c[1], c[2])

            result.push(new Path([line[0], line[1], line[2]]),this.color)
        }
        let normalCube = new Cube(this.min, this.max)
        result.push(normalCube.paths())
        return new Paths(result)


    }

}