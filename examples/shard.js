

import { Scene, Vector, Shard, Translate, TransformedShape, radians } from "../src/viewport.js";


let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let eye = new Vector(3, 0, 5)


let scene = new Scene()

let shard = new Shard(-1, -1, -1, 1)
let n = 3
for (let x = -n; x < n; x+=1.5) {
    for (let y = -n; y < n; y+=1.5) {

        let matrix = Translate(new Vector(x, y, 0))
        
        matrix = matrix.scale(new Vector(.5,.5,Math.random()+1))
        matrix = matrix.rotate(new Vector(0,0,1),radians(Math.random()*20))
        // matrix = matrix.rotate(new Vector(0,1,0),radians(Math.random()*90))

        let shape = new TransformedShape(shard, matrix)
        scene.add(shape)
    }
}
// scene.add(shard)



// let A = rotate(eye,0)
// console.log(eye,A,A.mulDirection(eye))

// eye = A.mulPosition(eye)
// console.log(eye)

let h = 500
let w = 500
let fovy = 80
console.log(scene)
// scene.ortho(true)

let paths = scene.render(eye, center, up, w, h, fovy, 0.01, 100, 0.001)
console.log(paths)
console.log(scene, 2)
// paths.pathsToSVG(paths,h,w)
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, h, w) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)
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
