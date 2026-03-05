

import { Scene, Cube,Vector,ShadedSphere,Cone ,StripedCube, TransformedShape, Translate,Sphere} from "../src/viewport.js";


let scene = new Scene()
let n = 0
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let eye = new Vector(3, 0, 3)


let cube = new Cube()
let light = new Vector(-1,1,3)
let c = -5
let s = .5
let cube2 = new Cube(new Vector(c-s,c-s,c-s),new Vector(c+s*3,c+s,c+s*3))
let cone = new Cone(.3,1.5)
cone = new TransformedShape(cone,Translate(new Vector(2,0,0)))
let stripeCube = new StripedCube(new Vector(-.5,-.5,-.5), new Vector(.5,.5,.5), 10, 10, 0, .8, 0, .5)
scene.add(cone)
let sphere = new Sphere(new Vector(0,.2,.1),.5)
// let sphere = new ShadedSphere(new Vector(0,0,0),.5,light,eye,up,150,120)
// let sphere = new OutlineSphere(new Vector(0,.2,.1),.5,eye,up)
let matrix = Translate(new Vector(-2,0,0))
sphere = new TransformedShape(sphere,matrix)
// let sphere = new HSphere(new Vector(0,.2,.1),.5,50)

matrix = matrix.translate(new Vector(0,-3,0))
cube = new TransformedShape(cube2 ,matrix)
scene.add(stripeCube)

scene.add(sphere)
scene.add(cube)

// let A = Rotate(eye,0)
// console.log(eye,A,A.mulDirection(eye))

// eye = A.mulPosition(eye)
// console.log(eye)

let h = 250
let w = 250
let fovy = 80
console.log(scene)
// scene.ortho(true)

let paths = scene.render(eye, center, up, w, h, fovy, 0.01, 100,0.1)
console.log(paths)
console.log(scene, 2)
// paths.pathsToSVG(paths,h,w)
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)///im not sure why we really have to go back and forth here, but i think we do. 
            
            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)
;
            // while (path.type === "paths"){
            //     path = path.paths
            // }
            // console.log(path.paths[0].paths[0].verts);

            for (let vert of path.verts) {

                s.vertex(vert.x, vert.y)

            }
            s.endShape()
            s.pop()
        }
        s.noLoop()
    };
};

let myp5 = new p5(sketch, 'p5sketch');
