

import { Scene, Vector, loadOBJ, Box, Plane } from "../src/viewport.js";

async function loadObject() {

    //    let object= loadBinaryStl('./assets/Cube.stl')
    let object = loadOBJ('./assets/suzanne.obj')
    return object
}
// console.log(m
let scene = new Scene()




let paths


let eye = new Vector(3, 1, 3)
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let h = 1000
let w = 1000
let fovy = 30
console.log(scene)

const sketch = (sketch) => {

    let slices = 32
    let size = 1024
    let s = sketch
    sketch.setup = async () => {
        sketch.createCanvas(w, h);
        const mesh = await loadObject()
        mesh.fitInside(new Box(new Vector(-1, -1, -1), new Vector(1, 1, 1)), new Vector(.5, .5, .5))

        for (let i = 0; i < slices; i++) {
            let p = ((i) / (slices - 1)) * 2 - 1
            let point = new Vector(0,0,p)
            let plane = new Plane(point,new Vector(0,0,1))
            paths = plane.intersectMesh(mesh)
        }

        paths = scene.render(eye, center, up, w, h, fovy, 0.01, 100, 0.01)

        // paths.pathsToSVG(paths,h,w)

    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)
            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)

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
