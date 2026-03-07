
import { Scene, Cube,Vector,loadOBJ } from "../src/viewport.js";


async function loadObject() {
    let object = loadOBJ("./assets/wildSphere.obj") 
    return object
}
let scene = new Scene()




let cube = new Cube()

let paths


let eye = new Vector(0, 1, 3)
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let h = 250
let w = 250
let fovy = 30

const sketch =  (sketch) => {


    let s = sketch
    sketch.setup =async  () => {
        sketch.createCanvas(w, h);
         let save = function (){paths.pathsToSVG(paths,h,w)}

        let saveButton = s.createButton("Save")
        saveButton.position(0,h)
        saveButton.mousePressed( save)
        const  mesh = await loadObject()
        let cubes = mesh.voxelize(1/36)

        for (let cube of cubes){
            scene.add(cube)
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
