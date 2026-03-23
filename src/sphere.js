
import { Vector ,randomUnitVector} from './vector.js'
import { Box } from './box.js'
import { Path,Paths } from './path.js'
import { Translate,Rotate } from './matrix.js'
import { radians } from './util.js'
import { Hit ,noHit} from './hit.js'
import { remap } from './util.js'
/**
     * Primitive of sphere, default paths show lat and longitude
     * @param {Vector} center of sphere
     * @param {Number} radius of sphere
     */
export class Sphere {
    
    constructor(center, radius) {
        this.center = center
        this.radius = radius

        let min = new Vector(this.center.x - radius, this.center.y - radius, this.center.z - radius)
        let max = new Vector(this.center.x + radius, this.center.y + radius, this.center.z + radius)
        this.box = new Box(min, max)
        this.color = "#000000"

    }
    compile() {

    }
    boundingBox() {
        return this.box
    }
    contains(v, f) {
        let s = this
        // console.log(v,v.sub(s.center))
       return v.sub(s.center).length() <= s.radius + f
    }
    intersect(ray) {
        let s = this
        let radius = this.radius

        let to = ray.origin.sub(s.center)
        let b = to.dot(ray.direction)
        let c = to.dot(to) - radius * radius
        let d = b * b - c

        if (d > 0) {
            d = Math.sqrt(d)
            let t1 = -b - d
            if (t1 > 1e-2) {
                return new Hit(s, t1)
            }
            let t2 = -b + d
            if (t2 > 2e-2) {
                return new Hit(s, t2)
            }
        }
        return noHit

    }
    paths4() {// random lines but with collision logic? 
        let paths = []
        let seen = []
        let radii = []
        for (let i = 0; i < 140; i++) {
            let v
            let m
            for (; ;) {
                v = randomUnitVector()
                 m = Math.random() * 0.25 + 0.05
                let ok = true

                for (let i = 0; i < seen.length; i++) {
                    let other = seen[i]
                    let threshold = m + radii[i] + 0.02
                    if (other.sub(v).length() < threshold) {
                        ok = false
                        break
                    }
                }
                if (ok) {
                    seen.push(v)
                    radii.push(m)
                    break
                }

            }

            let p = v.cross(randomUnitVector()).normalize()
            let q = p.cross(v).normalize()
            let n = Math.round(Math.random() * 4) + 1
            let path = []

            for (let k = 0; k < n; k++) {
                for (let j = 0; j <= 360; j += 5) {


                    let a = radians(j)
                    let x = v
                    x = x.add(p.mulScalar(Math.cos(a) * m))
                    x = x.add(q.mulScalar(Math.sin(a) * m))
                    x = x.normalize()
                    x = x.mulScalar(s.radius).add(s.center)
                    path.push(x)

                }
                paths.push(path)
                m *= .75
            }

        }
        return new Paths(paths)


    }
    paths11() {// random dots all over
        let s = this
        let paths = []

        for (let i = 0; i < 20000; i++) {
            let v = randomUnitVector()
            v = v.mulScalar(s.radius).add(s.center)
            paths.push(new Path([v, v],this.color))

        }
        return new Paths(paths)

    }
    paths111() {
        let s = this
        let equator = []
        for (let lng = 0; lng <= 360; lng++) {
            let v = latLngToXYZ(0, lng, s.radius)
            equator.push(v)
        }
        let paths = []
        for (let i = 0; i < 100; i++) {
            let m = new Matrix()
            for (let j = 0; j < 3; j++) {
                let v = randomUnitVector()
                m = m.rotate(v, Math.random() * 2 * Math.PI)
            }
            m = m.translate(s.center)
            paths.push(equator.transform(m))
        }
        return new Paths(paths)

    }
    paths() {
        let s = this
        let paths = []
        let n = 10
        let o = 10
        for (let lat = -90 + o; lat <= 90 - o; lat += n) {
            let path = []
            for (let lng = 0; lng <= 360; lng++) {
                let v = latLngToXYZ(lat, lng, this.radius).add(s.center)
                // v=v.add(s.center)
                

                path.push(v)
            }
            paths.push(new Path(path,this.color))


        }
        for (let lng = 0; lng <= 360; lng += n) {
            let path = []
            for (let lat = -90 + o; lat <= 90 - o; lat++) {
                let v = latLngToXYZ(lat, lng, this.radius+.00003).add(this.center)
                // v=v.add(new Vector(0,0,.1))

                path.push(v)
            }   
            paths.push(new Path(path,this.color))
        }
        return new Paths(paths)
    }
}


export function latLngToXYZ(lat, lng, radius) {
     lat = radians(lat)
     lng = radians(lng)
    let x = radius * Math.cos(lat) * Math.cos(lng)
    let y = radius * Math.cos(lat) * Math.sin(lng)
    let z = radius * Math.sin(lat)

    return new Vector(x, y, z)
}
 /**
     * 
     * @constructor
     * @param {Vector} center  of sphere
     * @param {Vector} radius 
     * @param {Vector} eye 
     * @param {Vector} up 
     */
 export class OutlineSphere extends Sphere{
   
    constructor(center,radius,eye,up){
        
        super(center,radius)
        this.eye=eye
        this.up= up

    }
    paths(){
        let path = []
        let center = this.center
        let radius = this.radius
        // console.log(this.eye,center.sub(this.eye))
        let hyp = center.sub(this.eye).length()
        let opp = radius
        let theta = Math.asin(opp/hyp)
        let adj = opp/ Math.tan(theta)
        let d = Math.cos(theta)*adj
        let r = Math.sin(theta)*adj

        let w = center.sub(this.eye).normalize()
        let u = w.cross(this.up).normalize()
        let v = w.cross(u).normalize()
        let c = this.eye.add(w.mulScalar(d))

        //  console.log(w,u,v,c)
        for(let i= 0; i<=360;i++){
            let a = radians(i)
            let p = c 
            p = p.add(u.mulScalar(Math.cos(a)*r))
            p = p.add(v.mulScalar(Math.sin(a)*r))
            path.push(p)
        }
        return new Paths([new Path(path)])

    }


}

/**
     * Horizontal lines sphere
     * 
     * @param {Vector} center 
     * @param {Number} radius 
     * @param {Number} stripes amount of stripes
     */
export class HSphere extends Sphere{
   
    constructor(center,radius,stripes){
        super(center,radius)
        this.stripes = stripes
    }
    paths(){
        let paths = []
        let offset = 180.0/this.stripes
        for(let lat = -90+5;lat <=90-5;lat+=offset){
            let path = []
            for(let lng = 0;lng <=360;lng++){
                let v = latLngToXYZ(lat,lng,this.radius).add(this.center)
                path.push(v)

            }
            paths.push(new Path(path,this.color))

        }
        return new Paths(paths)
    }
}
/**
     * sphere with simulated shading based on posiition of light
     * @param {Vector} center 
     * @param {Vector} radius 
     * @param {Vector} light 
     * @param {Vector} eye 
     * @param {Vector} up 
     * @param {Number} pathLen 
     * @param {Number} density percent idk
     */
export class ShadedSphere extends Sphere{
    
    constructor(center, radius, light, eye, up ,density, pathLen ){
        super(center,radius)
        this.light = light
        this.eye = eye
        this. up= up 
        this.density = density
        this.pathLen = pathLen
    }
    paths(){
        let paths = []
        let s = this

        let lo = s.light.sub(s.center).normalize()
        let angleStep = .1
        let maxSteps = s.pathLen
        let numSamples = remap(s.density,0,1,100,1000)*s.radius*s.radius
        for(let i=0;i<numSamples;i++){
            let path = []
            let p = randomUnitVector().mulScalar(s.radius)
            let rotAxis = lo.cross(p).normalize()
            let pNorm = lo.dot(p.normalize())
            let nSteps = maxSteps-remap(pNorm,-1,1,5,maxSteps)
            for(let j=0; j<nSteps;j++){
                let rotM = Rotate(rotAxis,radians(angleStep*j))
                let newPoint = rotM.mulDirection(p).normalize().mulScalar(s.radius).add(s.center)
                path.push(newPoint)
            }
            paths.push(new Path(path,this.color))
        }s
        // let outLine = new OutlineSphere(s.center,s.radius,s.eye,s.up)
        // paths.push(outLine.paths()[0])

        return new Paths(paths)

    }
}