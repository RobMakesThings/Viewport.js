import { Box } from "./box.js"
import { EPS } from "./common.js"
import { Hit,noHit } from "./hit.js"
import { Vector,max,min } from "./vector.js"
import { radians } from "./util.js"
import { Path,Paths } from "./path.js"
let above = 0
let below = 1

export let Direction = { above: above, below: below }
 /**
  * Plot lines based on equation in 3d space
     * @param {function} func given function in arrow format 
     * @example (x,y)=>{return -1/(x*x+y*y)}
     * 
     * @param {Box} box 
     * for bounding box of function lines
     * @param {1|0} Direction for above or below 
     * @see {@link ../examples/functionTests.js} 
     */
export class FunctionLines {
   
    constructor(func, box, Direction) {
        this.function = func
        this.box = box
        this.direction = Direction
    }
    
    compile() {
    }
    boundingBox() {
        return this.box
    }
    contains(v, eps = EPS) {///maybe we need eps for troubleshooting who knows. 
     
        if (this.direction == below) {
            return v.z < this.function(v.x, v.y)
        }
        if (this.direction == above) {
            return v.z > this.function(v.x, v.y)
        }

    }
    intersect(ray) {

        let step = 1.0 / 64
        let sign = this.contains(ray.position(step), 0)
        // console.log(sign);
        // return noHit
        
        for (let t = step; t < 10; t += step) {
            let v = ray.position(t)
            // console.log(v);
        // return noHit

            if (this.contains(v, 0) != sign && this.box.contains(v)) {
                
                return new Hit(this, t)
            }
        }
        return noHit
    }
    paths3() {
        let path = []
        let n = 10000
        for (let i = 0; i < n; i++) {
            let t = i / n/// maps zero to 1
            let r = 8 - Math.pow(t, .01) * 8
            let x = Math.cos(radians(t * 2 * Math.PI * 3000)) * r
            let y = Math.sin(radians(t * 2 * Math.PI * 3000)) * r
            let z = this.function(x, y)
            z = min(z, this.box.max.z)
            z = max(z, this.box.min.z)
            path.push(new Vector(x, y, z))

        }
        return new Paths(new Path(path))
    }
    paths() {
        let paths = []
        let fine = 1 / 256
        for (let a = 0; a < 360; a += 5) {
            let path = []
            for (let r = 0; r <= 8; r += fine) {
                let x = Math.cos(radians(a)) * r
                let y = Math.sin(radians(a)) * r
                let z = this.function(x, y)
                let o = Math.pow(-z, 1.4)
                x = Math.cos(radians(a) - o) * r
                y = Math.sin(radians(a) - o) * r
                z = Math.min(z, this.box.max.z)
                z = max(z, this.box.min.z)
                path.push(new Vector(x, y, z))
            }
            paths.push(new Path(path))

        }
        return new Paths(paths)

    }
    paths1() {
        let paths = []
        let step = 1 / 8
        let fine = 1 / 64
        for (let x = this.box.min.x; x <= this.box.max.x; x += step) {
            let path = []
            for (let y = this.box.min.y; y <= this.box.max.y; y += fine) {
                let z = this.function(x, y)
                z = min(z, this.box.max.z)
                z = max(z, this.box.min.z)
                path.push(new Vector(x, y, z))
            }
            paths.push(new Path(path))
        }
        for (let y = this.box.min.y; y <= this.box.max.y; y += step) {
            let path = []
            for (let x = this.box.min.x; x <= this.box.max.x; y += fine) {
                let z = this.function(x, y)
                z = min(z, this.box.max.z)
                z = max(z, this.box.min.z)
                path.push(new Vector(x, y, z))

            }
            paths.push(new Path(path))

        }
        return new Paths(paths)

    }

}