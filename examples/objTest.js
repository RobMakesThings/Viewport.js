

import { Scene, Vector, loadTextSTL,Translate, radians } from "../src/viewport.js";

async function loadObject() {
    // const text = await fetch("./assets/crazyCube.obj").then(r => r.text());

    // let object = loadOBJ(text) 
//    let object= loadBinaryStl('./assets/Cube.stl')
   let object= loadTextSTL('./assets/CubeText.stl')
    console.log(object)
    return object
}
// console.log(m
let scene = new Scene()

let n = 1




let paths
// scene.add(cube)
// scene.add(cube2)


let eye = new Vector(3, 1, 3)
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let h = 1000
let w = 1000
let fovy = 30
console.log(scene)

const sketch =  (sketch) => {


    let s = sketch
    sketch.setup =async  () => {
        sketch.createCanvas(w, h);
        const  mesh = await loadObject()
        // mesh.fitInside(cube.boundingBox(),new Vector(.5,.5,.5))
        mesh.unitCube()
        let tMatrix = Translate(new Vector(.2,.2,0))
        tMatrix = tMatrix.rotate(up,radians(90))
        tMatrix = tMatrix.rotate(new Vector(0,1,0),radians(90))

        // mesh.transform(tMatrix)
        // mesh.moveTo(new Vector(2,2,.2),new Vector(5,.5,.5))
        scene.add(mesh)
        paths = scene.render(eye, center, up, w, h, fovy, 0.01, 100, 0.01)
        console.log(paths)
        console.log(scene, 2)
        // paths.pathsToSVG(paths,h,w)

    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
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
