import { Box } from "./box.js"
import {Mesh} from "./mesh.js"
import { EPS } from "./common.js"
import { Vector,min,max } from './vector.js'
// import { Box } from './box.js'
import { Hit,noHit } from './hit.js'

import { Path,Paths } from './path.js'
 /**
     * for use inside a {@link Mesh}
     * @param {Vector} v1 vertex 1
     * @param {Vector} v2 vertex 3
     * @param {Vector} v3 vertex 3
     */
export class Triangle {
   
    constructor(v1, v2, v3) {/// have to pass a  vector 
        this.v1 = v1
        this.v2 = v2
        this.v3 = v3
        this.box
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
        
        if (v < 0 || u+v > 1) {
            return noHit
        }
        let d = (e2x * qx + e2y * qy + e2z * qz) * inv
        if (d < EPS) {
            return noHit
        }
        return new Hit(t,d)
    }
    paths(){
        let t = this
        return  new Paths([
            new Path([t.v1,t.v2]),
            new Path([t.v2,t.v3]),
            new Path([t.v3,t.v1])

        ]
        
            
        )

    }

}